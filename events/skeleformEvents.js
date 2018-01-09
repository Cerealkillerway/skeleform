let debugType = 'skeleform';
let skeleformInstance;

// get configuration from skeletor or from the app
configuration = Skeletor.configuration;


// VALIDATION
// ==========================================================================================
// looks up for translated string if argument is not a number
function translateErrorDetail(detail) {
    let regex = /^([0-9]|[ #\-\+\(\)])+$/;

    if (regex.test(detail) === false) return TAPi18n.__(detail + '_validationDetail');
    return detail;
}

setReplicaIndex = function(instance) {
    if (instance.data.replicaSet) {
        instance.replicaIndex = instance.data.formInstance.replicaSets[instance.data.replicaSet.name].index;
    }
};


setInvalid = function(id, schema, result) {
    SkeleUtils.GlobalUtilities.logger('VALIDATION - invalid ' + id, debugType);
    let errorString = '';
    let reasons = result.reasons;
    let isShadowField = false;

    if (id.indexOf('ShadowConfirm') >= 0) {
        isShadowField = true;
    }

    if (reasons.length === 1 && reasons[0] === 'shadowValue' && !isShadowField) {
        Skeleform.utils.skeleformSuccessStatus(id);

        id = id + 'ShadowConfirm';
        isShadowField = true;
    }

    for (i = 0; i < reasons.length; i++) {
        if (i > 0) errorString = errorString +' - ';

        let errorDetail;
        let rValue = reasons[i];

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

    Skeleform.utils.skeleformErrorStatus(id, errorString, schema);
};


// validation loop for entire form against fields' values
skeleformValidateForm = function(data, Fields) {
    let valid = true;
    let currentLang = FlowRouter.getParam('itemLang');

    try {
        Fields.forEach(function(field) {
            let fieldSchema = field.data.schema.get();
            let $field = $getFieldById(field, fieldSchema);

            if ($field.hasClass('skeleValidate')) {
                let result = field.isValid();

                if (!result.valid) {
                    throw {field: field, result: result};
                }
            }
        });
    }
    catch(error) {
        valid = false;
        let schema = error.field.data.schema.get();
        let id = schema.name.replace('.', '\\.');
        let offsetCorrection = 80;

        setInvalid(id, schema, error.result);

        if ($('.staticTop').length === 0) {
            offsetCorrection = offsetCorrection + 66;
        }
        SkeleUtils.GlobalUtilities.scrollTo($('.invalid').first().offset().top - offsetCorrection, configuration.animations.scrollError);
    }

    return valid;
};
Skeleform.utils.skeleformValidateForm = skeleformValidateForm;


//reset success and error status on the form
Skeleform.utils.skeleformResetStatus = function(name) {
    let column = $('#' + name).closest('.col');

    if (name) {
        column.alterClass('valid invalid', '');
        column.find('.skeleformFieldAlert').html('');
    }
    else {
        $('.col').alterClass('valid invalid', '');
        $('.skeleformFieldAlert').html('');
    }
};


//set success status
Skeleform.utils.skeleformSuccessStatus = function(name, schema) {
    let selector = '#' + name;
    let column = $(selector).closest('.col');
    let fieldAlert = column.find('.skeleformFieldAlert');

    column.alterClass('invalid', 'valid');
    fieldAlert.html('');

    if (schema && schema.shadowConfirm) {
        Skeleform.utils.skeleformSuccessStatus(name + 'ShadowConfirm');
    }
};


//set error status
Skeleform.utils.skeleformErrorStatus = function(name, errorString, schema) {
    let selectors = [];
    let validation = schema.validation;

    if (validation.showErrorOn) {
        if (Array.isArray(validation.showErrorOn)) {
            for (id of validation.showErrorOn) {
                selectors.push('#' + name);
            }
        }
        else {
            selectors.push('#' + schema.validation.showErrorOn);
        }
    }
    else {
        selectors.push('#' + name);
    }

    selectors.forEach(function(selector) {
        let column = $(selector).closest('.col');
        let fieldAlert = column.find('.skeleformFieldAlert');

        column.alterClass('valid', 'invalid');
        fieldAlert.html(TAPi18n.__('error_validation', errorString));
    });
};


//clean up the form
skeleformCleanForm = function() {
    //empty input fields
    $('input.skeleValidate').val('');
    $('input.shadowField').val('');
    //empty editors
    $('.editor').materialnote('code', '');
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

        let ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    Skeleform.utils.skeleformResetStatus();
};


//handle method results and performs error/success operations on the client
skeleformHandleResult = function(error, result, type, data, paths) {
    if (error) {
        if (error.error === 'unauthorized') {
            Materialize.toast(TAPi18n.__('permissions_error'), 5000, 'permissionsError');
            SkeleUtils.GlobalUtilities.logger(error, 'skeleWarning', false, true);
        }
        else {
            Materialize.toast(TAPi18n.__('serverError_error'), 5000, 'error');
            SkeleUtils.GlobalUtilities.logger(error, 'skeleWarning', false, true);
        }
    }
    else {
        let title, content;
        switch (type) {
            case 'update':
            title = TAPi18n.__('updateConfirm_msg');
            content = TAPi18n.__('genericUpdate_msg');
            break;

            case 'create':
            title = TAPi18n.__('insertConfirm_msg');
            content = TAPi18n.__('genericInsert_msg');
            skeleformCleanForm();
            break;
        }

        Materialize.toast(content, 1300, 'success');

        // handle redirect
        let redirectPath = paths['redirectOn' + type.capitalize()];

        // if the form is setted up for a redirect after the current action -> redirect
        if (redirectPath) {
            let params = createPath(redirectPath, data);

            // if updating, maybe the fields that are dynamic segments have not been gathered (because they are unchanged);
            // in that case they are undefined in the "data" object so we need to get them from current url
            _.each(params.params, function(param, paramName) {
                if (param === undefined) {
                    params.params[paramName] = FlowRouter.getParam(paramName);
                }
            });

            params.queryParams.lang = FlowRouter.getQueryParam('lang');

            Session.set('currentItem', undefined);    // reset skelelist's setted currentItem

            FlowRouter.go(redirectPath[0], params.params, params.queryParams);
        }
        // otherwise scroll to top
        else {
            SkeleUtils.GlobalUtilities.scrollTo(0, configuration.animations.scrollTop);
        }
    }
};


// GATHERING
// gather data from form's fields
skeleformGatherData = function(formContext, Fields) {
    let formItem = formContext.item;
    let lang = FlowRouter.getParam('itemLang');
    let data = {};
    let replicasToClean = [];

    Fields.forEach(function(field) {
        let fieldSchema = field.data.schema.get();
        let $field = $getFieldById(field, fieldSchema);
        let fieldName;

        if (field.data.replicaSet) {
            fieldName = field.data.replicaSet.name;
        }
        else {
            fieldName = fieldSchema.name;
        }

        if ($field.hasClass('skeleGather')) {
            let fieldValue = field.getValue();

            if (fieldSchema.i18n === undefined) {
                fieldName = lang + '---' + fieldName;

                /*console.log(fieldSchema.name);
                console.log('currentValue: ' + currentValue);
                console.log('fieldValue: ' + fieldValue);
                console.log('******************************');*/

            }
            let currentValue = formItem ? formItem[fieldName] : undefined;

            // force gathering of replica sets always
            if (field.data.replicaSet) {
                currentValue = undefined;
            }

            if ((currentValue === undefined) || fieldValue !== currentValue) {
                // in case of replicaset, update the relative field in the array or create a new one if needed
                if (field.data.replicaSet) {
                    let $replicaContainer = $(field.firstNode).closest('.skeleformReplicaSet');
                    let $replicas = $replicaContainer.find('.skeleformReplicaFrame');
                    let $currentReplica = $(field.firstNode).closest('.skeleformReplicaFrame')
                    let index = $replicas.index($currentReplica)

                    if (data[fieldName] === undefined) {
                        data[fieldName] = [];
                    }

                    if (data[fieldName][index]) {
                        data[fieldName][index][fieldSchema.name] = fieldValue;
                    }
                    else {
                        while (data[fieldName].length < index) {
                            data[fieldName].push({});
                        }

                        let replicaObject = {};

                        replicaObject[fieldSchema.name] = fieldValue;
                        data[fieldName].push(replicaObject);
                    }
                }
                else {
                    data[fieldName] = fieldValue;
                }
            }
        }
        else {
            SkeleUtils.GlobalUtilities.logger('Skipped field: ' + fieldSchema.name, 'skeleWarning');
        }
    });

    SkeleUtils.GlobalUtilities.logger('<separator>form gathered data:', debugType);
    SkeleUtils.GlobalUtilities.logger(data, debugType);

    return data;
};
Skeleform.utils.skeleformGatherData = skeleformGatherData;


// Skeleform
Template.skeleform.onCreated(function() {
    //Session.set('formRendered', false);
    this.formRendered = new ReactiveVar(false);

    this.Fields = [];
    this.replicaSets = {};
});
Template.skeleform.onRendered(function() {
    skeleformInstance = this;
    this.formRendered.set(true);
    let data = this.data;
    let schema = data.schema;

    if (schema.__autoScrollTop !== false) {
        SkeleUtils.GlobalUtilities.scrollTo(0, configuration.animations.onRendered);
    }

    // set toolbar in container if needed
    let toolbar = schema.__toolbar;

    if (toolbar && toolbar.containerId) {
        /*if (data.Fields === undefined) {
            data.Fields = this.Fields;
        }*/
        let toolbarContext = {
            Fields: this.Fields,
            formContext: this.data
        };
        this.toolbarInstance = Blaze.renderWithData(Template[toolbar.template], toolbarContext, $('#' + toolbar.containerId)[0]);
    }

    if (schema.__autoFocusFirst !== false) {
        let $skeleFields = this.$('.skeleGather');

        for (const field of $skeleFields) {
            let $field = $(field);

            if ($field.hasClass('editor')) {
                $field.focusWithoutScrolling();
                break;
            }
            if ($field.is('input') || $field.is('textarea')) {
                if ($field.is(':visible')) {
                    $field.focusWithoutScrolling();
                    break;
                }
            }
        }
    }

    this.autorun(function() {
        if (data.skeleSubsReady.get()) {
            // clean validation alerts
            Skeleform.utils.skeleformResetStatus();
        }
    });

    this.autorun(() => {
        // register dependency from form's language
        let formLang = FlowRouter.getParam('itemLang');
        // register dependency from form's data
        let item = this.data.item;

        if (this.data.skeleSubsReady.get()) {
            // fire onRendered callback if it's defined
            if (schema.formCallbacks && schema.formCallbacks.onRendered) {
                schema.formCallbacks.onRendered(this.data.item, skeleformInstance);
            }
        }
    });

    this.autorun(function() {
        if (Skeletor.appRendered.get() === true) {
            // static bar
            let $bar = $('.skeleformToolbar');

            if ($bar.length > 0) {
                let barOffset = Math.round($bar.offset().top * 1) / 1;

                SkeleUtils.GlobalUtilities.logger ('static bar calculated offset: ' + barOffset, debugType);

                $(window).on('scroll', function() {
                    let $placeholder = this.$('.skeleskeleStaticBarPlaceholder');

                    if ($(document).scrollTop() >= barOffset) {
                        let height = $('.skeleStaticBar').height();

                        if (height > $placeholder.height()) {
                            $placeholder.height(height);
                        }

                        $('.skeleStaticBar').addClass('staticTop');
                        $('.staticTop').children().addClass('skeleCentralBody hPadded');
                    }
                    else {
                        $placeholder.height(0);
                        $('.staticTop').children().removeClass('skeleCentralBody hPadded');
                        $('.skeleStaticBar').removeClass('staticTop');
                    }
                });
            }
        }
    });
});


Template.skeleform.onDestroyed(function() {
    if (this.toolbarInstance) {
        Blaze.remove(this.toolbarInstance);
    }

    let data = this.data;
    let schema = data.schema;

    // if necessary call "onClose" callback
    if (schema.formCallbacks && schema.formCallbacks.onClose) {
        schema.formCallbacks.onClose(data.item, this);
    }

    $(window).unbind('scroll');
});


// create buttons (toolbar)
Template.skeleformCreateButtons.events({
    'click .skeleformCreate': function(event, template) {
        let formContext = template.data.formContext;
        let Fields = template.data.Fields;
        let data = skeleformGatherData(formContext, Fields);
        let schema = formContext.schema;
        let method;
        let options = {};

        if (schema.__options) {
            if (schema.__options.loadingModal) {
                options.useModal = true;
            }
        }

        // select method to call for this operation
        if (schema.__methods && schema.__methods.create) {
            method = schema.__methods.create;
        }
        else {
            method = configuration.defaultMethods.create;
        }

        // if necessary launch form callbacks!
        if (schema.formCallbacks && schema.formCallbacks.beforeSave) {
            data = schema.formCallbacks.beforeSave(template.data, data);
        }

        if (skeleformValidateForm(data, Fields)) {
            if (options.useModal) {
                $('#gearLoadingModal').openModal();
            }

            SkeleUtils.GlobalUtilities.logger('will now call method: ' + method + ' data:', 'skeleform');
            SkeleUtils.GlobalUtilities.logger(data, 'skeleform');
            SkeleUtils.GlobalUtilities.logger('schema name: ' + formContext.schemaName, 'skeleform');
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
        let formContext = template.data.formContext;
        let Fields = template.data.Fields;
        let data = skeleformGatherData(formContext, Fields);
        let documentId = formContext.item._id;
        let schema = formContext.schema;
        let method;
        let options = {};

        if (schema.__options) {
            if (schema.__options.loadingModal) {
                options.useModal = true;
            }
        }

        // select method to call for this operation
        if (schema.__methods && schema.__methods.update) {
            method = schema.__methods.update;
        }
        else {
            method = configuration.defaultMethods.update;
        }

        // if necessary launch form callbacks!
        if (schema.formCallbacks && schema.formCallbacks.beforeSave) {
            data = schema.formCallbacks.beforeSave(template.data, data);
        }

        if (skeleformValidateForm(data, Fields)) {
            if (options.useModal) {
                $('#gearLoadingModal').openModal();
            }

            SkeleUtils.GlobalUtilities.logger('will now call method: ' + method + ' data:', 'skeleform');
            SkeleUtils.GlobalUtilities.logger(data, 'skeleform');
            SkeleUtils.GlobalUtilities.logger('documentId: ' + documentId, 'skeleform');
            SkeleUtils.GlobalUtilities.logger('schema name: ' + formContext.schemaName, 'skeleform');

            Meteor.call(method, documentId, data, formContext.schemaName, function(error, result) {
                if (options.useModal) {
                    $('#gearLoadingModal').closeModal();
                }

                skeleformHandleResult(error, result, 'update', data, schema.__paths);
            });
        }
    }
});


// skeleform language bar
Template.skeleformLangBar.events({
    'click .langFlag': function(event, template) {
        let newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});


// skeletor static addons
Template.skeleformStaticAddons.events({
    'click .toTop': function(event, template) {
        SkeleUtils.GlobalUtilities.scrollTo(0, configuration.animations.scrollTop);
    },
    'click .toBottom': function(event, template) {
        // if there are no errors in the form -> scroll to page's bottom
        if ($('.invalid').length === 0) {
            SkeleUtils.GlobalUtilities.scrollTo($('body').height(), configuration.animations.scrollBottom);
        }
        // otherwise scroll to first error
        else {
            let offsetCorrection = 80;

            if ($('.staticTop').length === 0) {
                offsetCorrection = offsetCorrection + 66;
            }

            SkeleUtils.GlobalUtilities.scrollTo($('.invalid').first().offset().top - offsetCorrection, configuration.animations.scrollBottom);
        }
    }
});
