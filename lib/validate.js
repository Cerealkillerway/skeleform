import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Random } from 'meteor/random';


// data object check
Skeleform.validate.checkData = function(data, schemaName, documentId) {
    let item;
    let formSchema = Skeletor.Schemas[schemaName];
    let collection = formSchema.__collection;
    let fieldSchemas = {};
    let updatedFields = {};

    if (documentId) {
        item = Skeletor.Data[collection].findOne({_id: documentId});
    }

    // gets all field schemas from the form schema
    function traverseSchema(schema) {
        for (schemaItem of schema.fields) {
            if (schemaItem.fields) {
                traverseSchema(schemaItem);
            }
            else {
                fieldSchemas[schemaItem.name] = schemaItem;
            }
        }

        if (schema.extraFieldsAllowed) {
            for (schemaItem of schema.extraFieldsAllowed) {
                if (schemaItem.fields) {
                    traverseSchema(schemaItem);
                }
                else {
                    fieldSchemas[schemaItem.name] = schemaItem;
                }
            }
        }
    }

    traverseSchema(formSchema);

    function traverseData(dataObject) {
        let result = {
            valid: true,
            resons: []
        };

        //_.each(dataObject, function(fieldValue, fieldName) {
        for (let pair of Object.entries(dataObject)) {
            let fieldName = pair[0];
            let fieldValue = pair[1];

            fieldName = Skeletor.SkeleUtils.ClientServerUtilities.getFieldName(fieldName);
            result.fieldName = fieldName.name;

            // handling skeleformGroups
            if (!fieldSchemas[fieldName.name]) {
                if (Array.isArray(fieldValue)) {
                    for (subData of fieldValue) {
                        let nestedValidation = traverseData(subData);

                        if (nestedValidation.valid === false) {
                            return nestedValidation;
                        }
                    }
                }
                else {
                    result.valid = false;
                    result.reason = 'notInSchema';
                    result.detail = 'field not in schema';
                    return result;
                }
            }
            else {
                result = Skeleform.validate.checkOptions(fieldValue, fieldSchemas[fieldName.name], formSchema, item, fieldName.lang);

                if (_.size(result.updatedFields) > 0) {
                    _.extend(updatedFields, result.updatedFields);
                }

                if (result.valid === false) {
                    return result;
                }
            }
        }

        return result;
    }

    let validationResult = traverseData(data);

    validationResult.updatedFields = updatedFields;
    return validationResult;
};


// single value check
Skeleform.validate.checkOptions = function(passedValue, fieldSchema, formSchema, item, lang) {
    'use strict';
    let result = {
        valid: true,
        reasons: [],
        updatedFields: {}
    };
    let validationOptions = fieldSchema.validation;
    let value;

    result.fieldName = fieldSchema.name;

    // shadow confirm
    // extract values if received value is an object containing standard value and shadow confirm
    if (fieldSchema.shadowConfirm) {
        var shadowValue = passedValue.shadow;
        value = passedValue.standard;

        value = Skeletor.SkeleUtils.GlobalUtilities.purgeNullUndefined(value);
        shadowValue = Skeletor.SkeleUtils.GlobalUtilities.purgeNullUndefined(shadowValue);

        if (value !== shadowValue) {
            result.valid = false;
            result.reasons.push('shadowValue');
        }
    }
    else {
        value = passedValue;
        value = Skeletor.SkeleUtils.GlobalUtilities.purgeNullUndefined(value);
    }

    if (validationOptions) {
        // min length
        if (validationOptions.min !== undefined) {
            if (value.length < validationOptions.min) {
                result.valid = false;
                result.reasons.push('min');
            }
        }

        // max length
        if (validationOptions.max !== undefined) {
            if (value.length > validationOptions.max) {
                result.valid = false;
                result.reasons.push('max');
            }
        }

        // type check
        if (validationOptions.type !== undefined) {
            var typeValid = true;
            var regex;
            switch (validationOptions.type.toLowerCase()) {
                case 'string':
                typeValid = Match.test(value, String);
                break;

                case 'number':
                regex = /^([0-9]|[ #\-\+\(\)]*)+$/;
                if (regex.test(value) === false) typeValid = false;
                break;

                case 'float':
                regex = /([0-9]*\,[0-9]+|[0-9]+)/g;
                if (regex.test(value) === false) typeValid = false;
                break;

                case 'email':
                if (value.length > 0) {
                    regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (regex.test(value) === false) typeValid = false;
                }
                break;

                case 'url':
                regex = /^([a-z]|[0-9]|[-\_]*)+$/;
                if (regex.test(value) === false) typeValid = false;
                break;

                case 'date':
                if (value.length > 0) {
                    if (validationOptions.pickerOptions && validationOptions.pickerOptions.formatSubmit) {
                        if (!moment(value, validationOptions.pickerOptions.formatSubmit, true).isValid()) typeValid = false;
                    }
                    else {
                        if (!moment(value, 'YYYYMMDD', true).isValid() && !moment(value, 'YYYY-MM-DD', true).isValid()) {
                            typeValid = false;
                        }
                    }
                }
                break;

                case 'time':
                if (value.length > 0) {
                    if (validationOptions.pickerOptions && validationOptions.pickerOptions.formatSubmit) {
                        if (!moment(value, validationOptions.pickerOptions.formatSubmit, true).isValid()) typeValid = false;
                    }
                    else {
                        if (!moment(value, 'HHmm', true).isValid()) typeValid = false;
                    }
                }
                break;
            }

            if (!typeValid) {
                result.valid = false;
                result.reasons.push('type');
            }
        }

        // unique check
        if (validationOptions.unique) {
            let previousValue;
            let field;
            let query = {};
            let projection = {};
            let collection;

            // if is a server-side validation, the lang parameter is passed to this function;
            // otherwise get it from the router
            if (Meteor.isClient) {
                lang = FlowRouter.getParam('itemLang');
            }

            if (fieldSchema.i18n === undefined) {
                field = lang + '---' + fieldSchema.name;
            }
            else {
                field = fieldSchema.name;
            }

            if (validationOptions.ignoreCaseForUnicity) {
                // use a regex to make the query case insensitive
                query[field] = {$regex: new RegExp('^' + value.toLowerCase() + '$', 'i')};
            }
            else {
                query[field] = value;
            }

            // if the unicity check must be performed against a different collection
            if (validationOptions.collectionForUnicityCheck) {
                collection = Skeletor.Data[validationOptions.collectionForUnicityCheck];
                projection[field] = 1;

                if (collection.findOne(query, {fields: projection})) {
                    if (fieldSchema.validation.unique === 'autoset') {
                        let uniqueValue = `${value}-${Random.id()}`;

                        Skeletor.SkeleUtils.GlobalUtilities.logger(`autoset for unique field ${fieldSchema.name} - value: ${uniqueValue}`)
                        result.updatedFields[fieldSchema.name] = uniqueValue;
                    }
                    else {
                        result.valid = false;
                        result.reasons.push('unique');
                    }
                }
            }

            // otherwise perform it against current collection and current record
            else {
                collection = Skeletor.Data[formSchema.__collection];

                // check against document's current value (since it can be changed by user before being saved)
                // in that case that "previous value" is allowed
                if (item !== undefined) {
                    projection[field] = 1;
                    previousValue = collection.findOne({_id: item._id}, {fields: projection});

                    if (previousValue) {
                        if (fieldSchema.i18n === undefined || fieldSchema.i18n === true) {
                            previousValue = previousValue[lang + '---' + fieldSchema.name] || '';
                        }
                        else {
                            previousValue = previousValue[field];
                        }
                    }
                }

                if (validationOptions.ignoreCaseForUnicity && previousValue) {
                    value = value.toLowerCase();
                    previousValue = previousValue.toLowerCase();
                }

                // if it's a new document creation, previousValue is undefined -> always do the test
                // otherwise if value = previousValue, the test is not necessary (if previousValue was unique, it still is)
                if ((value !== previousValue) && (collection.findOne(query, {fields: projection}))) {
                    if (fieldSchema.validation.unique === 'autoset') {
                        let uniqueValue = `${value}-${Random.id()}`;

                        Skeletor.SkeleUtils.GlobalUtilities.logger(`autoset for unique field ${fieldSchema.name} - value: ${uniqueValue}`)
                        result.updatedFields[fieldSchema.name] = uniqueValue;
                    }
                    else {
                        result.valid = false;
                        result.reasons.push('unique');
                    }
                }
            }
        }
    }

    return result;
};


// validation loop for entire form against fields' values
Skeleform.validate.skeleformValidateForm = function(data, fields) {
    let valid = true;
    let currentLang = FlowRouter.getParam('itemLang');

    try {
        fields.forEach(function(field) {
            let fieldSchema = field.data.fieldSchema.get();
            let $field = Skeleform.utils.$getFieldById(field, fieldSchema);

            if ($field.hasClass('skeleValidate')) {
                let result = field.isValid();

                if (!result.valid) {
                    throw {field: field, result: result};
                }
            }
        });
    }
    catch(error) {
        console.log(error);
        valid = false;
        let schema = error.field.data.fieldSchema.get();
        let id = Skeletor.SkeleUtils.GlobalUtilities.createSelector(schema.name);

        Skeleform.validate.setInvalid(id, schema, error.result, error.field);

        Skeleform.validate.scrollToFirstError();
    }

    return valid;
};


Skeleform.validate.scrollToFirstError = function() {
    let offsetCorrection = 80;

    if ($('.skeleStaticTop').length === 0) {
        offsetCorrection = offsetCorrection + 66;
    }
    Skeletor.SkeleUtils.GlobalUtilities.scrollTo($('.invalid').first().offset().top - offsetCorrection, Skeletor.configuration.animations.scrollError);
}


Skeleform.validate.setInvalid = function(id, schema, result, field) {
    let errorString = '';
    let reasons = result.reasons;
    let isShadowField = false;

    id = Skeleform.utils.createFieldId(field, schema.name, false);

    if (id.indexOf('ShadowConfirm') >= 0) {
        isShadowField = true;
    }

    if (reasons.length === 1 && reasons[0] === 'shadowValue' && !isShadowField) {
        Skeleform.validate.skeleformSuccessStatus(id);

        id = id + 'ShadowConfirm';
        isShadowField = true;
    }

    Skeletor.SkeleUtils.GlobalUtilities.logger('VALIDATION - invalid ' + id, 'skeleform');

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
                errorString = errorString + Skeletor.Skelelang.i18n.get(result.invalidMessages[rValue] + '_validation');
            }
            else {
                errorDetail = Skeleform.validate.translateErrorDetail(schema.validation[rValue]);
                errorString = errorString + Skeletor.Skelelang.i18n.get(rValue + '_validation', errorDetail);
            }
        }
    }

    Skeleform.validate.skeleformErrorStatus(id, errorString, schema);
};


//reset success and error status on the form
Skeleform.validate.skeleformResetStatus = function(name) {
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
Skeleform.validate.skeleformSuccessStatus = function(name, schema) {
    let selector = '#' + name;
    let column = $(selector).closest('.col');
    let fieldAlert = column.find('.skeleformFieldAlert');

    column.alterClass('invalid', 'valid');
    fieldAlert.html('');

    if (schema && schema.shadowConfirm) {
        Skeleform.validate.skeleformSuccessStatus(name + 'ShadowConfirm');
    }
};


//set error status
Skeleform.validate.skeleformErrorStatus = function(name, errorString, schema) {
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
        selector = Skeletor.SkeleUtils.GlobalUtilities.createSelector(selector);

        let $column = $(selector).closest('.col');
        let $fieldAlert = $column.find('.skeleformFieldAlert');

        $column.alterClass('valid', 'invalid');
        $fieldAlert.html(Skeletor.Skelelang.i18n.get('error_validation', errorString));
    });
};


// looks up for translated string if argument is not a number
Skeleform.validate.translateErrorDetail = function(detail) {
    let regex = /^([0-9]|[ #\-\+\(\)])+$/;

    if (regex.test(detail) === false) return Skeletor.Skelelang.i18n.get(detail + '_validationDetail');
    return detail;
}
