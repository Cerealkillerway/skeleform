var debugType = "skeleform";
var skeleformInstance;

// get configuration from skeletor or from the app
if (Package['cerealkiller:skeletor']) {
    configuration = Package['cerealkiller:skeletor'].Skeletor.configuration;
    ckUtils.globalUtilities.logger('loaded configuration:', 'skeleform');
    ckUtils.globalUtilities.logger(configuration, 'skeleform');
}
else {
    ckUtils.globalUtilities.logger('Can\'t load configuration from Skeletor', 'skeleError', true);
}


// VALIDATION
// ==========================================================================================
//looks up for translated string if argument is not a number
function translateErrorDetail(detail) {
    var regex = /^([0-9]|[ #\-\+\(\)])+$/;
    if (regex.test(detail) === false) return TAPi18n.__(detail + "_validationDetail");
    return detail;
}

function setInvalid(id, schema, result) {
    ckUtils.globalUtilities.logger('VALIDATION - invalid ' + id, debugType);
    var errorString = "";

    result.reasons.forEach(function(rValue, rIndex) {
        if (rIndex > 0) errorString = errorString +' - ';

        var errorDetail;
        if (schema.validation !== undefined) errorDetail = translateErrorDetail(schema.validation[rValue]);
        errorString = errorString + TAPi18n.__(rValue + "_validation", errorDetail);
    });

    skeleformErrorStatus(id, errorString, schema.output);
}

//validation loop for entire form against fields' values
skeleformValidateForm = function(data, Fields) {
    var valid = true;
    var currentLang = FlowRouter.getParam('itemLang');

    try {
        Fields.forEach(function(field) {
            var result = field.isValid();

            if (!result.valid) {
                throw {field: field, result: result};
            }
        });
    }
    catch(error) {
        valid = false;
        var schema = error.field.data.schema;
        var id = "#" + schema.name.replace('.', '\\.');
        var offsetCorrection = 80;

        setInvalid(id, schema, error.result);

        if ($('.staticTop').length === 0) {
            offsetCorrection = offsetCorrection + 66;
        }
        ckUtils.globalUtilities.scrollTo($('.invalid').first().offset().top - offsetCorrection, configuration.animations.scrollError);
    }

    return valid;
};

//validation for single field
//called directly for inline validation
skeleformValidateField = function(fieldInstance) {
    var data = fieldInstance.data;
    var item = data.item;
    var schema = data.schema;

    var documentId;

    if (item) {
        documentId = item._id;
    }

    if (!Session.get('formRendered')) return;
    var id = "#" + schema.name.replace('.', '\\.');
    var result = fieldInstance.isValid();

    if (!result.valid) {
        setInvalid(id, schema, result);
    }
    else {
        skeleformSuccessStatus(id, schema.output);
    }
    return result.valid;
};

//reset success and error status on the form
skeleformResetStatus = function(id) {
    var column = $('#' + id).closest('.col');

    if (id) {
        column.alterClass('valid', '');
        column.find('.skeleformFieldAlert').html("");
    }
    else {
        $('.col').alterClass('valid', '');
        $('.skeleformFieldAlert').html("");
    }
};

//set success status
skeleformSuccessStatus = function(id, special) {
    var column = $(id).closest('.col');
    var fieldAlert = column.find('.skeleformFieldAlert');

    column.alterClass('invalid', 'valid');
    fieldAlert.html("");
};

//set error status
skeleformErrorStatus = function(id, errorString, special) {
    var column = $(id).closest('.col');
    var fieldAlert = column.find('.skeleformFieldAlert');

    column.alterClass('valid', 'invalid');
    fieldAlert.html(TAPi18n.__("error_validation", errorString));
};

//clean up the form
skeleformCleanForm = function() {
    //empty input fields
    $('input.skeleValidate').val('');
    $('input.shadowField').val('');
    //empty editors
    $('.editor').code('');
    //select first option on select boxes
    $('select.skeleValidate').val('admin');

    $('.fileLoader').value = "";
    $('.fileLoader').siblings('.fleNameContainer').html('');

    $.each($('canvas'), function(index, canvas) {
        $(canvas).removeClass('canvasImage');
        $(canvas).removeClass('canvasThumb');
        $(canvas).parent().addClass('canvasContainerEmpty');

        canvas.width = 300;
        canvas.height = 150;

        var ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    skeleformResetStatus();
};

//handle method results and performs error/success operations on the client
skeleformHandleResult = function(error, result, type, data, paths) {
    if (error) {
        Materialize.toast(TAPi18n.__("serverError_error"), 5000, 'error');
    }
    else {
        var title, content;
        switch (type) {
            case 'update':
            title = TAPi18n.__("updateConfirm_msg");
            content = TAPi18n.__("pageUpdatedOk_msg");
            break;

            case 'create':
            title = TAPi18n.__("insertConfirm_msg");
            content = TAPi18n.__("genericInsert_msg");
            skeleformCleanForm();
            break;
        }

        Materialize.toast(content, 1300, 'success', function() {
            var redirectPath = paths['redirectOn' + type.capitalize()];

            // if the form is setted up for a redirect after the current action -> redirect
            if (redirectPath) {
                var params = createPath(redirectPath, data);

                params.queryParams.lang = FlowRouter.getQueryParam("lang");

                Session.set('currentItem', undefined);    // reset skelelist's setted currentItem

                FlowRouter.go(redirectPath[0], params.params, params.queryParams);
            }
            // otherwise scroll to top
            else {
                ckUtils.globalUtilities.scrollTo(0, configuration.animations.scrollTop);
            }
        });
    }
};


// GATHERING
// gather data from form's fields
skeleformGatherData = function(formContext, Fields) {
    var formItem = formContext.item;
    var lang = FlowRouter.getParam('itemLang');
    var data = {};

    Fields.forEach(function(field) {
        var fieldSchema = field.data.schema;
        var fieldValue = field.getValue();

        if (fieldSchema.i18n === undefined) {
            // gather field only if creating, current lang does not exists already, or value is different from the stored one
            if (!formItem || !formItem[lang] || (formItem[lang] && fieldValue !== formItem[lang][fieldSchema.name])) {
                // if creating
                if (!formItem) {
                    // create the data object for current lang
                    if (!data[lang]) {
                        data[lang] = {};
                    }

                    // set value of the field
                    data[lang][fieldSchema.name] = fieldValue;
                }
                // if updating
                else {
                    // set value of the field with "dot notation" for mongo update
                    data[lang + '.' + fieldSchema.name] = fieldValue;
                }
            }
        }
        else {
            if (!formItem || fieldValue !== formItem[fieldSchema.name]) {
                data[fieldSchema.name] = fieldValue;
            }
        }
    });

    ckUtils.globalUtilities.logger('<separator>form gathered data:', 'skeleform');
    ckUtils.globalUtilities.logger(data, 'skeleform');

    return data;
};


// Skeleform
Template.skeleform.onCreated(function() {
    Session.set('formRendered', false);

    this.Fields = [];
});
Template.skeleform.onRendered(function() {
    var self = this;
        skeleformInstance = self;

    ckUtils.globalUtilities.scrollTo(0, configuration.animations.onRendered);

    Session.set('formRendered', true);
    Tracker.autorun(function() {
        if (FlowRouter.subsReady()) {
            skeleformResetStatus();    // clean validation alerts
        }
    });

    // set toolbar in container if needed
    var toolbar = this.data.schema.__toolbar;
    if (toolbar && toolbar.containerId) {
        Blaze.renderWithData(Template[toolbar.template], this.data, $('#' + toolbar.containerId)[0]);
    }

    $('input:first').focusWithoutScrolling();

    Tracker.autorun(function() {
        if (Session.equals('appRendered', true)) {
            // static bar
            var $bar = $('.skeleformToolbar');


            if ($bar.length > 0) {
                var barOffset = Math.round($bar.offset().top * 1) / 1;
                ckUtils.globalUtilities.logger ('static bar calculated offset: ' + barOffset, 'skeleform');

                $(window).on('scroll', function() {
                    if ($(document).scrollTop() >= barOffset) {
                        $('.staticBar').addClass('staticTop');
                        $('.staticTop').children().addClass('centralBody hPadded');
                    }
                    else {
                        $('.staticTop').children().removeClass('centralBody hPadded');
                        $('.staticBar').removeClass('staticTop');
                    }
                });
            }
        }
    });
});
Template.skeleform.destroyed = function() {
    $(window).unbind('scroll');
};


// create buttons (toolbar)
Template.skeleformCreateButtons.events({
    "click .skeleformCreate": function(event, template) {
        var formContext = template.data.formContext;
        var Fields = template.data.Fields;
        var data = skeleformGatherData(formContext, Fields);
        var schema = formContext.schema;
        var method;
        var options = {};

        if (schema.__options) {
            if (schema.__options.loadingModal) {
                options.useModal = true;
            }
        }

        if (!formContext.method) {
            method = configuration.defaultMethods.insert;
        }
        else {
            method = formContext.method.insert;
        }

        if (skeleformValidateForm(data, Fields)) {
            if (options.useModal) {
                $('#gearLoadingModal').openModal();
            }

            Meteor.call(method, data, formContext.schemaName, function(error, result) {
                if (options.useModal) {
                    $('#gearLoadingModal').closeModal();
                }
                skeleformHandleResult(error, result, 'create', data, schema.__paths);
            });
        }
    }
});

// update buttons (toolbar)
Template.skeleformUpdateButtons.events({
    "click .skeleformUpdate": function(event, template) {
        var formContext = template.data.formContext;
        var Fields = template.data.Fields;
        var data = skeleformGatherData(formContext, Fields);
        var documentId = formContext.item._id;
        var schema = formContext.schema;
        var method;
        var options = {};

        if (schema.__options) {
            if (schema.__options.loadingModal) {
                options.useModal = true;
            }
        }

        if (!formContext.method) {
            method = configuration.defaultMethods.update;
        }
        else {
            method = formContext.method.update;
        }

        // get route params to manage if current update should redirect to a new path
        var currentRoute = FlowRouter.current();
        var params = currentRoute.params;
        var unNestedDataKeys = [];
        var relationships = {};

        ckUtils.globalUtilities.logger ('url change monitor:', 'skeleform');
        ckUtils.globalUtilities.logger(params, 'skeleform');
        params = _.keys(params);
        dataKeys = _.keys(data);

        dataKeys.forEach(function(dataKey, index) {
            var unNested = dataKey.split('.');
                unNested = unNested[unNested.length - 1];

            unNestedDataKeys.push(unNested);
            relationships[unNested] = dataKey;  // save original name of un-nested param
        });

        var changedParams = _.intersection(params, unNestedDataKeys);

        if (skeleformValidateForm(data, Fields)) {
            if (options.useModal) {
                $('#gearLoadingModal').openModal();
            }

            Meteor.call(method, documentId, data, formContext.schemaName, function(error, result) {
                if (options.useModal) {
                    $('#gearLoadingModal').closeModal();
                }
                skeleformHandleResult(error, result, 'update', data, schema.__paths);
            });
            if (changedParams.length > 0) {
                var newParams = {};

                changedParams.forEach(function(param, index) {
                    newParams[param] = data[relationships[param]];
                });
                FlowRouter.setParams(newParams);
            }
        }
    }
});


// skeleform language bar
Template.skeleformLangBar.events({
    "click .langFlag": function(event, template) {
        var newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});

// skeletor static addons
Template.skeleformStaticAddons.events({
    "click .toTop": function(event, template) {
        ckUtils.globalUtilities.scrollTo(0, configuration.animations.scrollTop);
    },
    "click .toBottom": function(event, template) {
        // if there are no errors in the form -> scroll to page's bottom
        if ($('.invalid').length === 0) {
            ckUtils.globalUtilities.scrollTo($('body').height(), configuration.animations.scrollBottom);
        }
        // otherwise scroll to first error
        else {
            var offsetCorrection = 80;

            if ($('.staticTop').length === 0) {
                offsetCorrection = offsetCorrection + 66;
            }

            ckUtils.globalUtilities.scrollTo($('.invalid').first().offset().top - offsetCorrection, configuration.animations.scrollBottom);
        }
    }
});
