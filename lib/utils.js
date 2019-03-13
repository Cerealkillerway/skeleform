import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let configuration = Skeletor.configuration;


Skeleform.utils.registerField = function(instance) {
    let formContext = instance.data.formContext;

    formContext.fields.push(instance);
};


//clean up the form
Skeleform.utils.skeleformCleanForm = function() {
    //empty input fields
    $('input.skeleValidate').val('');
    $('input.shadowField').val('');
    //empty editors
    $('.skeleEditor').html('');
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

    Skeleform.validate.skeleformResetStatus();
};


//handle method results and performs error/success operations on the client
Skeleform.utils.skeleformHandleResult = function(error, result, type, schema, formContext) {
    let item = formContext.item;
    let data = result.data;

    if (error) {
        if (error.error === 'unauthorized') {
            Materialize.toast(Skeletor.Skelelang.i18n.get('permissions_error'), 5000, 'permissionsError');
            SkeleUtils.GlobalUtilities.logger(error, 'skeleWarning', false, true);
        }
        else {
            switch (error.reason) {
                case 'Email already exists.':
                    //Materialize.toast(Skeletor.Skelelang.i18n.get('emailAlreadyUsed_error'), 5000, 'error');
                    for (field of formContext.fields) {
                        let fieldSchema = field.data.fieldSchema.get();
                        let validationRules = fieldSchema.validation;

                        if (validationRules.showErrorFor && validationRules.showErrorFor === error.reason) {
                            let fieldName = fieldSchema.name;
                            let fieldInstance = SkeleUtils.GlobalUtilities.getFieldInstance(formContext, fieldName);
                            let fieldId = Skeleform.utils.createFieldId(fieldInstance, fieldName, false);
                            let errorData = {
                                reasons: [
                                    'emailAlreadyUsed'
                                ]
                            }

                            Skeleform.validate.setInvalid(fieldId, fieldSchema, errorData, fieldInstance);
                            Skeleform.validate.scrollToFirstError();

                            break;
                        }
                    }
                    break;

                case 'serverSideValidation':
                    let errorData = JSON.parse(error.error);
                    let fieldName = errorData.fieldName;
                    let fieldInstance = SkeleUtils.GlobalUtilities.getFieldInstance(formContext, fieldName);
                    let fieldId = Skeleform.utils.createFieldId(fieldInstance, fieldName, false);
                    let fieldSchema = SkeleUtils.GlobalUtilities.fieldSchemaLookup(schema.fields, fieldName);

                    /*console.log(fieldName);
                    console.log(fieldId);
                    console.log(fieldSchema);
                    console.log(errorData);
                    console.log(fieldInstance);
                    console.log(schema.fields);*/

                    Skeleform.validate.setInvalid(fieldId, fieldSchema, errorData, fieldInstance);
                    Skeleform.validate.scrollToFirstError();
                    break;

                default:
                    Materialize.toast(Skeletor.Skelelang.i18n.get('serverError_error'), 5000, 'error');
            }
            SkeleUtils.GlobalUtilities.logger(error, 'skeleWarning', false, true);
        }
    }
    else {
        let title, content;
        switch (type) {
            case 'update':
            title = Skeletor.Skelelang.i18n.get('updateConfirm_msg');
            content = Skeletor.Skelelang.i18n.get('genericUpdate_msg');
            break;

            case 'create':
            title = Skeletor.Skelelang.i18n.get('insertConfirm_msg');
            content = Skeletor.Skelelang.i18n.get('genericInsert_msg');
            Skeleform.utils.skeleformCleanForm();
            break;
        }

        Materialize.toast(content, 1300, 'success');

        // handle redirect
        let redirectPath = schema.__paths['redirectOn' + type.capitalize()];

        // if the form is setted up for a redirect after the current action -> redirect
        if (redirectPath) {
            let params = Skeleform.utils.createPath(redirectPath, data, schema, item);

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
Skeleform.utils.skeleformGatherData = function(formContext, fields) {
    let item = formContext.item;
    let lang = FlowRouter.getParam('itemLang');
    let data = {};
    let replicasToClean = [];

    fields.forEach(function(field) {
        let fieldData = field.data;
        let fieldSchema = fieldData.fieldSchema.get();
        let $field = Skeleform.utils.$getFieldById(field, fieldSchema);
        let fieldName = fieldSchema.name;;

        if ($field.hasClass('skeleGather')) {
            let fieldValue = field.getValue();

            if (fieldSchema.i18n === undefined && field.data.replicaIndex === undefined) {
                fieldName = lang + '---' + fieldName;

                /*console.log(fieldSchema.name);
                console.log('currentValue: ' + currentValue);
                console.log('fieldValue: ' + fieldValue);
                console.log('******************************');*/

            }
            let currentValue

            // force gathering of replica sets always
            if (fieldData.replicaIndex) {
                currentValue = undefined;
            }
            else {
                currentValue = item ? item[fieldName] : undefined;
            }

            if ((currentValue === undefined) || fieldValue !== currentValue) {
                // in case of replicaset, update the relative field in the array or create a new one if needed
                if (fieldData.replicaIndex !== undefined) {
                    //let index = fieldData.replicaIndex;
                    let replicaOptions = fieldData.replicaOptions;
                    let replicaName = replicaOptions.name;

                    let $replicaContainer = $(field.firstNode).closest('.skeleformReplicaSet');
                    let $replicas = $replicaContainer.find('.skeleformReplicaFrame');
                    let $currentReplica = $(field.firstNode).closest('.skeleformReplicaFrame')
                    let index = $replicas.index($currentReplica);

                    if (replicaOptions.i18n === undefined) {
                        replicaName = lang + '---' + replicaName;
                    }

                    if (data[replicaName] === undefined) {
                        data[replicaName] = [];
                    }

                    if (data[replicaName][index]) {
                        data[replicaName][index][fieldName] = fieldValue;
                    }
                    else {
                        while (data[replicaName].length < index) {
                            data[replicaName].push({});
                        }

                        let replicaObject = {};

                        replicaObject[fieldName] = fieldValue;
                        data[replicaName].push(replicaObject);
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

    SkeleUtils.GlobalUtilities.logger('<separator>form gathered data:', 'skeleform');
    SkeleUtils.GlobalUtilities.logger(data, 'skeleform');

    return data;
};


// invoke a specific callback for a field
Skeleform.utils.InvokeCallback = function(instance, value, schema, type, forceExecution) {
    if (schema.callbacks) {
        switch (type) {
            case 'onCreated':
            // if defined, perform the callback
            if (schema.callbacks.onCreated) {
                schema.callbacks.onCreated(instance);
            }
            break;

            case 'onRendered':
            // if defined, perform the callback
            if (schema.callbacks.onRendered) {
                schema.callbacks.onRendered(instance);
            }
            break;

            case 'onChange':
            // if defined, perform the callback
            if (schema.callbacks.onChange) {
                if (forceExecution) {
                    schema.callbacks.onChange(value, instance);
                }
                else {
                    switch (schema.output) {
                        case 'select':
                        if (value !== undefined || instance.data.formContext.isRestoringData) {
                            schema.callbacks.onChange(value, instance);
                        }
                        break;

                        default:
                        if ((value !== undefined && value !== instance.getValue()) || (value === undefined && instance.data.formContext.isRestoringData)) {
                            schema.callbacks.onChange(value, instance);
                        }
                    }
                }
            }
            break;
        }
    }
};


Skeleform.utils.createFieldId = function(instance, name, isSelecting) {
    let replicaIndex = instance.data.replicaIndex;

    if (isSelecting) {
        name = name.replace('.', '\\.');
    }

    if (replicaIndex !== undefined) {
        return name + '-' + replicaIndex;
    }

    return name;
}


// get the field's object
Skeleform.utils.$getFieldById = function(instance, schema) {
    return instance.$('#' + Skeleform.utils.createFieldId(instance, schema.name, true));
};


// get the field' shadow object
$getShadowFieldId = function(instance, schema) {
    return instance.$('#' + schema.name.replace('.', '\\.') + 'ShadowConfirm');
};


// standard function to set the value on a field;
// it waits for any custom initialization on the field, and reactively watch lang changes
// and fires appropriate i18n method on the field is special handling for i18n is required
Skeleform.utils.setFieldValue = function(instance, item, fieldSchema, formContext) {
    instance.view.autorun(function() {
        // register dependency from current language; used to fire custom i18n callback
        // for fields that requires special i18n treatment...
        let currentLang = Skeletor.Skelelang.i18n.currentLocale.get();
        let formRendered = instance.data.formContext.formRendered.get();

        // object used to ensure that each callback is executed only once per computation
        if (!instance.callbacksCalled) {
            instance.callbacksCalled = {
                onChange: false,
            };
        }
        // variable used to ensure that validation is executed only once per computation
        if (instance.isValidated === undefined) {
            instance.isValidated = false;
        }

        // avoid setting the value if the view is not fully rendered yet
        let isActivated = instance.isActivated.get();

        if (isActivated === true) {
            if (!instance.data.formContext.skeleSubsReady.get()) {
                return false;
            }

            let value = Skeleform.utils.SkeleformStandardFieldValue(item, fieldSchema, instance);

            //SkeleUtils.GlobalUtilities.logger(fieldSchema.name + '-value: ' + value, 'skeleformCommon');
            //SkeleUtils.GlobalUtilities.logger(fieldSchema.name + '-getValue(): ' + instance.getValue(), 'skeleformCommon');
            //SkeleUtils.GlobalUtilities.logger('------------------', 'skeleformCommon');

            instance.setValue(value);

            function validationAndI18n() {
                instance.isValid();
                instance.isValidated = true;

                // call custom i18n if necessary
                if (instance.i18n) {
                    instance.i18n(currentLang);
                }
            }

            let validationOptions = fieldSchema.validation;

            if (validationOptions && validationOptions.unique) {
                if (value === undefined || value.length === 0) {
                    validationAndI18n();
                    return;
                }

                let collection = formContext.schema.__collection;
                let subManager = formContext.schema.__subManager;
                let query = {};
                let options = {
                    fields: {}
                };
                let field;

                if (fieldSchema.i18n === undefined) {
                    field = FlowRouter.getParam('itemLang') + '---' + fieldSchema.name;
                }
                else {
                    field = fieldSchema.name;
                }
                options.fields[field] = 1;

                if (validationOptions.ignoreCaseForUnicity) {
                    // use a regex to make the query case insensitive
                    query[field] = {$regex: new RegExp('^' + value.toLowerCase() + '$', 'i')};
                }
                else {
                    query[field] = value;
                }

                validationAndI18n();

            }
            else {
                validationAndI18n();
            }
        }
    });
};


// standard function to get a field's value form the current data object;
// it is defined here as a global function so that special field types can override "fieldValue" helper
// but still call this function if needed and then perform any special handling that is required
Skeleform.utils.SkeleformStandardFieldValue = function(item, fieldSchema, instance) {
    if (item === undefined) {
        return;
    }

    let name = fieldSchema.name;
    let fieldData;
    let data = instance.data;

    if (data.replicaIndex !== undefined) {
        let replicaOptions = data.replicaOptions;
        let replicaName = replicaOptions.name;
        let $replicaContainer = $(instance.firstNode).closest('.skeleformReplicaSet');
        let $replicas = $replicaContainer.find('.skeleformReplicaFrame');
        let $currentReplica = $(instance.firstNode).closest('.skeleformReplicaFrame')
        let index = $replicas.index($currentReplica);

        if (replicaOptions.i18n === undefined || replicaOptions.i18n === true)  {
            replicaName = FlowRouter.getParam('itemLang') + '---' + replicaName;
        }

        let replicaItem = item[replicaName];

        if (replicaItem === undefined || replicaItem[index] === undefined || data.replicaIndex > replicaItem.length) {
            return;
        }

        fieldData = SkeleUtils.GlobalUtilities.getPropertyFromString(name, replicaItem[index]);
    }
    else {
        if (fieldSchema.i18n === undefined || fieldSchema.i18n === true) {
            fieldData = SkeleUtils.GlobalUtilities.getPropertyFromString(FlowRouter.getParam('itemLang') + '---' + name, item)
        }
        else {
            fieldData = SkeleUtils.GlobalUtilities.getPropertyFromString(name, item);
        }
    }

    // set active class on label to avoid overlapping
    if (fieldSchema.output === 'input') {
        $('#' + fieldSchema.name).next('label').addClass('active');
    }

    /*if (fieldData === undefined) {
        return '';
    }*/

    /*console.log(name);
    console.log(fieldData);
    console.log('------------------');*/

    return fieldData;
};


// create paths for redirect after form actions
Skeleform.utils.createPath = function(path, data, schema, item) {
    let result = {
        params: {},
        queryParams: {}
    };
    let value;

    function handleParam(param, type, value) {
        switch (param) {
            case 'itemLang':
            case 'sLang':
            if (value === 'auto') {
                result[type][param] = FlowRouter.getParam('itemLang');
            }
            else  {
                result[type][param] = value;
            }
            break;

            default:
            if (value === 'this') {
                let fieldSchema = SkeleUtils.GlobalUtilities.fieldSchemaLookup(schema.fields, param);

                if (fieldSchema.i18n === false) {
                    result[type][param] = data[param] || item[param];
                }
                else {
                    let currentLang = FlowRouter.getParam('itemLang');

                    result[type][param] = data[currentLang + '---' + param] || item[currentLang + '---' + param];
                }
            }
            else {
                result[type][param] = value;
            }
        }
    }

    _.keys(path[1]).forEach(function(param) {
        value = path[1][param];

        handleParam(param, 'params', value);
    });

    if (path[2]) {
        _.keys(path[2]).forEach(function(queryParam) {
            value = path[2][queryParam];

            handleParam(queryParam, 'queryParams', value);
        });
    }

    return result;
};


// auto-save function
Skeleform.utils.autoSaveFormData = function(formContext, fields) {
    let data = Skeleform.utils.skeleformGatherData(formContext, fields);

    data.autoSaveInfo = {
        created: new Date()
    };

    formContext.autoSaves.push(data);

    SkeleUtils.GlobalUtilities.logger('form autosave', 'skeleSuccess');
}


// restore form data from data-snapshot
Skeleform.utils.restoreSavedData = function(formContext, savedDataIndex) {
    // if not specified restore the latest snapshot
    let restoreIndex = savedDataIndex || formContext.autoSaves.length - 1;
    let itemToRestore = formContext.autoSaves[restoreIndex];

    for (field of formContext.fields) {
        let data = field.data;
        let fieldSchema = data.fieldSchema.get();

        if (field.setValue !== undefined) {
            Skeleform.utils.setFieldValue(field, itemToRestore, fieldSchema, true);
        }
    }

    SkeleUtils.GlobalUtilities.logger('form restore from autosave', 'skeleform');
}


// create labels for skeleform fields
Skeleform.utils.createLabel = function(name, options) {
    name = name.split('.');

    for (i = 1; i < name.length; i++) {
        name[i] = name[i].capitalize();
    }
    name = name.join('');

    switch(options) {
        case 'shadowConfirm':
        return Skeletor.Skelelang.i18n.get(name + 'ShadowConfirm_lbl');

        case 'title':
        return Skeletor.Skelelang.i18n.get(name + '_title');

        case 'text':
        return Skeletor.Skelelang.i18n.get(name + '_text');

        case 'button':
        return Skeletor.Skelelang.i18n.get(name + '_btn');

        default:
        return Skeletor.Skelelang.i18n.get(name + '_lbl');
    }
}
