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

//validation loop for entire form against fields' values
skeleformValidateForm = function(data, schema) {
    var valid = true;
    var currentLang = FlowRouter.getParam('itemLang');

    for (var field in data) {
        var unNestedField = field;

        if (currentLang && field.indexOf(currentLang + '.') === 0) {
            unNestedField = field.replace(currentLang + '.', '');
        }

        if (schema[unNestedField]) {
            if (!skeleformValidateField(data[field], {schema: schema[unNestedField], item: Template.instance().data.item})) {
                valid = false;
                ckUtils.globalUtilities.logger('VALIDATION - failed on field: ' + field, debugType);
            }
            //check also shadowField if exists
            if (schema[unNestedField].shadowConfirm) {
                var id = '#' + schema[unNestedField].name + 'ShadowConfirm';
                var shadowValue = $(id).val();

                if (data[field] !== shadowValue) {
                    valid = false;
                    skeleformErrorStatus(id, TAPi18n.__("confirm_validation"));
                }
            }
        }
    }
    //scroll to meet the first error
    if (!valid) {
        ckUtils.globalUtilities.scrollTo($('.invalid').first().offset().top - 80, configuration.animations.scrollError);
    }

    return valid;
};

//validation for single field
//called directly for inline validation
skeleformValidateField = function(value, data) {
    var item = data.item;
    var schema = data.schema;

    var documentId;

    if (item) {
        documentId = item._id;
    }

    if (!Session.get('formRendered')) return;
    var collection = skeleformInstance.data.schema.__collection;
    var id = "#" + schema.name.replace('.', '\\.');
    var result = isValid(value, schema, collection, documentId);
    
    if (!result.valid) {
        ckUtils.globalUtilities.logger('VALIDATION - invalid ' + id, debugType);
        var errorString = "";

        result.reasons.forEach(function(rValue, rIndex) {
            if (rIndex > 0) errorString = errorString +' - ';

            var errorDetail;
            if (schema !== undefined) errorDetail = translateErrorDetail(schema[rValue]);
            errorString = errorString + TAPi18n.__(rValue + "_validation", errorDetail);
        });

        skeleformErrorStatus(id, errorString, schema.output);
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
            
            if (paths['redirectOn' + type.capitalize()]) {
                var params = {};

                _.keys(redirectPath[1]).forEach(function(param) {
                    if (redirectPath[1][param] === 'this') {
                        if (data[param]) {
                            params[param] = data[param];
                        }
                        else {
                            params[param] = data[FlowRouter.getParam('itemLang')][param];
                        }
                    }
                    else {
                        params[param] = redirectPath[1][param];
                    }
                });
                Session.set('currentItem', undefined);    // reset skelelist's setted currentItem

                FlowRouter.go(redirectPath[0], params, {lang: FlowRouter.getQueryParam("lang")});
            }
        });
    }
};


// GATHERING
// gather data from form's fields
skeleformGatherData = function(formContext) {
    var formItem = formContext.item;
    var lang = FlowRouter.getParam('itemLang');
    var data = {};

    formContext.schema.fields.forEach(function(fieldSchema) {
        var fieldValue = Skeleform.methods['skeleform' + fieldSchema.output.capitalize()].getValue(fieldSchema);

        if (fieldSchema.i18n === undefined) {
            if (!formItem || fieldValue !== formItem[lang][fieldSchema.name]) {
                if (!formItem) {
                    if (!data[lang]) {
                        data[lang] = {};
                    }
                    data[lang][fieldSchema.name] = fieldValue;
                }
                else {
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
        var data = skeleformGatherData(template.data);
        var schema = template.data.schema;
        var method;
        var options = {};

        if (schema.__options) {
            if (schema.__options.loadingModal) {
                options.useModal = true;
            }
        }

        if (!template.data.method) {
            method = configuration.defaultMethods.insert;
        }
        else {
            method = template.data.method.insert;
        }

        if (skeleformValidateForm(data, schema)) {
            if (options.useModal) {
                $('#gearLoadingModal').openModal();
            }

            Meteor.call(method, data, template.data.schemaName, function(error, result) {
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
        var data = skeleformGatherData(template.data);
        var documentId = template.data.item._id;
        var schema = template.data.schema;
        var method;
        var options = {};

        if (schema.__options) {
            if (schema.__options.loadingModal) {
                options.useModal = true;
            }
        }

        if (!template.data.method) {
            method = configuration.defaultMethods.update;
        }
        else {
            method = template.data.method.update;
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
        
        if (skeleformValidateForm(data, schema)) {
            if (options.useModal) {
                $('#gearLoadingModal').openModal();
            }

            Meteor.call(method, documentId, data, template.data.schemaName, function(error, result) {
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
        ckUtils.globalUtilities.scrollTo($('body').height(), configuration.animations.scrollBottom);
    }
});
