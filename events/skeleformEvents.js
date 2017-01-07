var debugType = 'skeleform';
var skeleformInstance;

// get configuration from skeletor or from the app
if (Package['cerealkiller:skeletor']) {
    configuration = Package['cerealkiller:skeletor'].Skeletor.configuration;
    skeleUtils.globalUtilities.logger('loaded configuration:', debugType);
    skeleUtils.globalUtilities.logger(configuration, debugType);
}
else {
    skeleUtils.globalUtilities.logger('Can\'t load configuration from Skeletor', 'skeleError', true);
}


// VALIDATION
// ==========================================================================================
// looks up for translated string if argument is not a number
function translateErrorDetail(detail) {
    var regex = /^([0-9]|[ #\-\+\(\)])+$/;
    if (regex.test(detail) === false) return TAPi18n.__(detail + '_validationDetail');
    return detail;
}


setInvalid = function(id, schema, result) {
    skeleUtils.globalUtilities.logger('VALIDATION - invalid ' + id, debugType);
    var errorString = '';
    var reasons = result.reasons;
    var isShadowField = false;

    if (id.indexOf('ShadowConfirm') >= 0) {
        isShadowField = true;
    }

    if (reasons.length === 1 && reasons[0] === 'shadowValue' && !isShadowField) {
        skeleformSuccessStatus(id);

        id = id + 'ShadowConfirm';
        isShadowField = true;
    }

    for (i = 0; i < reasons.length; i++) {
        if (i > 0) errorString = errorString +' - ';

        var errorDetail;
        var rValue = reasons[i];

        // ignore "shadowValue" validation error on the main field (this type of error should be displayed only on the shadow field)
        if (rValue === 'shadowValue' && !isShadowField) {
            continue;
        }

        if (schema.validation !== undefined) {
            // if there is an overridden value for the invalid message for the current reason, use that one; otherwise
            // build the standard message for that reason
            if (result.invalidMessages && result.invalidMessages[rValue]) {
                errorString = errorString + TAPi18n.__(result.invalidMessages[rValue] + '_validation');
            }
            else {
                errorDetail = translateErrorDetail(schema.validation[rValue]);
                errorString = errorString + TAPi18n.__(rValue + '_validation', errorDetail);
            }
        }
    }

    skeleformErrorStatus(id, errorString);
};


// validation loop for entire form against fields' values
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
        var id = '#' + schema.name.replace('.', '\\.');
        var offsetCorrection = 80;

        setInvalid(id, schema, error.result);

        if ($('.staticTop').length === 0) {
            offsetCorrection = offsetCorrection + 66;
        }
        skeleUtils.globalUtilities.scrollTo($('.invalid').first().offset().top - offsetCorrection, configuration.animations.scrollError);
    }

    return valid;
};
Skeleform.utils.skeleformValidateForm = skeleformValidateForm;


//reset success and error status on the form
skeleformResetStatus = function(id) {
    var column = $('#' + id).closest('.col');

    if (id) {
        column.alterClass('valid', '');
        column.find('.skeleformFieldAlert').html('');
    }
    else {
        $('.col').alterClass('valid', '');
        $('.skeleformFieldAlert').html('');
    }
};


//set success status
skeleformSuccessStatus = function(id, schema) {
    var selector = '#' + id;
    var column = $(selector).closest('.col');
    var fieldAlert = column.find('.skeleformFieldAlert');

    column.alterClass('invalid', 'valid');
    fieldAlert.html('');

    if (schema && schema.shadowConfirm) {
        skeleformSuccessStatus(id + 'ShadowConfirm');
    }
};


//set error status
skeleformErrorStatus = function(id, errorString) {
    var selector = '#' + id;
    var column = $(selector).closest('.col');
    var fieldAlert = column.find('.skeleformFieldAlert');

    column.alterClass('valid', 'invalid');
    fieldAlert.html(TAPi18n.__('error_validation', errorString));
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

    $('.fileLoader').value = '';
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
        Materialize.toast(TAPi18n.__('serverError_error'), 5000, 'error');
    }
    else {
        var title, content;
        switch (type) {
            case 'update':
            title = TAPi18n.__('updateConfirm_msg');
            content = TAPi18n.__('pageUpdatedOk_msg');
            break;

            case 'create':
            title = TAPi18n.__('insertConfirm_msg');
            content = TAPi18n.__('genericInsert_msg');
            skeleformCleanForm();
            break;
        }

        Materialize.toast(content, 1300, 'success', function() {
            var redirectPath = paths['redirectOn' + type.capitalize()];

            // if the form is setted up for a redirect after the current action -> redirect
            if (redirectPath) {
                var params = createPath(redirectPath, data);

                params.queryParams.lang = FlowRouter.getQueryParam('lang');

                Session.set('currentItem', undefined);    // reset skelelist's setted currentItem

                FlowRouter.go(redirectPath[0], params.params, params.queryParams);
            }
            // otherwise scroll to top
            else {
                skeleUtils.globalUtilities.scrollTo(0, configuration.animations.scrollTop);
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
            var currentValue = formItem ? formItem[lang + '---' + fieldSchema.name] : null;

            if (!currentValue || (currentValue && fieldValue !== currentValue)) {
                data[lang + '---' + fieldSchema.name] = fieldValue;
            }
        }
        else {
            if (!formItem || fieldValue !== formItem[fieldSchema.name]) {
                data[fieldSchema.name] = fieldValue;
            }
        }
    });

    skeleUtils.globalUtilities.logger('<separator>form gathered data:', debugType);
    skeleUtils.globalUtilities.logger(data, debugType);

    return data;
};
Skeleform.utils.skeleformGatherData = skeleformGatherData;


// Skeleform
Template.skeleform.onCreated(function() {
    //Session.set('formRendered', false);
    this.formRendered = new ReactiveVar(false);

    this.Fields = [];
});
Template.skeleform.onRendered(function() {
    var self = this;
        skeleformInstance = self;

    self.formRendered.set(true);
    skeleUtils.globalUtilities.scrollTo(0, configuration.animations.onRendered);

    // set toolbar in container if needed
    var toolbar = this.data.schema.__toolbar;
    if (toolbar && toolbar.containerId) {
        if (self.data.Fields === undefined) {
            self.data.Fields = self.Fields;
        }
        Blaze.renderWithData(Template[toolbar.template], this.data, $('#' + toolbar.containerId)[0]);
    }

    $('input:first').focusWithoutScrolling();

    self.autorun(function() {
        if (FlowRouter.subsReady()) {
            // clean validation alerts
            skeleformResetStatus();
        }
    });
    self.autorun(function() {
        if (Skeletor.appRendered.get() === true) {
            // static bar
            var $bar = $('.skeleformToolbar');

            if ($bar.length > 0) {
                var barOffset = Math.round($bar.offset().top * 1) / 1;
                skeleUtils.globalUtilities.logger ('static bar calculated offset: ' + barOffset, debugType);

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
    'click .skeleformCreate': function(event, template) {
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
    'click .skeleformUpdate': function(event, template) {
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

        skeleUtils.globalUtilities.logger ('url change monitor:', debugType);
        skeleUtils.globalUtilities.logger(params, debugType);
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
    'click .langFlag': function(event, template) {
        var newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});


// skeletor static addons
Template.skeleformStaticAddons.events({
    'click .toTop': function(event, template) {
        skeleUtils.globalUtilities.scrollTo(0, configuration.animations.scrollTop);
    },
    'click .toBottom': function(event, template) {
        // if there are no errors in the form -> scroll to page's bottom
        if ($('.invalid').length === 0) {
            skeleUtils.globalUtilities.scrollTo($('body').height(), configuration.animations.scrollBottom);
        }
        // otherwise scroll to first error
        else {
            var offsetCorrection = 80;

            if ($('.staticTop').length === 0) {
                offsetCorrection = offsetCorrection + 66;
            }

            skeleUtils.globalUtilities.scrollTo($('.invalid').first().offset().top - offsetCorrection, configuration.animations.scrollBottom);
        }
    }
});
