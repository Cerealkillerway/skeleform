// single value check
Skeleform.validate.checkOptions = function(passedValue, fieldSchema, formSchema, item) {
    var result = {
        valid: true,
        reasons: []
    };
    var validationOptions = fieldSchema.validation;
    var value;

    // shadow confirm
    // extract values if received value is an object containing standard value and shadow confirm
    if (fieldSchema.shadowConfirm) {
        var shadowValue = passedValue.shadow;
        value = passedValue.standard;

        value = SkeleUtils.GlobalUtilities.purgeNullUndefined(value);
        shadowValue = SkeleUtils.GlobalUtilities.purgeNullUndefined(shadowValue);

        if (value !== shadowValue) {
            result.valid = false;
            result.reasons.push('shadowValue');
        }
    }
    else {
        value = passedValue;
        value = SkeleUtils.GlobalUtilities.purgeNullUndefined(value);
    }

    //console.log(value);
    //console.log(fieldSchema);
    //console.log(formSchema);
    //console.log(item);
    //console.log(self);
    //console.log('-------------------------');

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
                        if (!moment(value, 'YYYYMMDD', true).isValid()) typeValid = false;
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
            var previousValue;
            var field;
            var query = {};
            var projection = {};
            var lang = FlowRouter.getParam('itemLang');

            if (fieldSchema.i18n === undefined) {
                field = lang + '---' + fieldSchema.name;
            }
            else {
                field = fieldSchema.name;
            }

            query[field] = value;

            // if the unicity check must be performed against a different collection
            if (validationOptions.collectionForUnicityCheck) {
                collection = Skeletor.Data[validationOptions.collectionForUnicityCheck];
                projection[field] = 1;

                if (collection.findOne(query, {fields: projection})) {
                    result.valid = false;
                    result.reasons.push('unique');
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

                    if (fieldSchema.i18n === undefined) {
                        previousValue = previousValue[lang + '---' + fieldSchema.name] || '';
                    }
                    else {
                        previousValue = previousValue[field];
                    }
                }
                if ((value !== previousValue) && (collection.findOne(query, {fields: projection}))) {
                    result.valid = false;
                    result.reasons.push('unique');
                }
            }
        }
    }

    /*SkeleUtils.GlobalUtilities.logger('field name: ' + fieldSchema.name + ' value: ' + value, 'skeleform');
    SkeleUtils.GlobalUtilities.logger(result, 'skeleform');
    SkeleUtils.GlobalUtilities.logger('-----------------------', 'skeleform');*/
    return result;
};
