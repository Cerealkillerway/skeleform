//single value check
Skeleform.validate.checkOptions = function(value, fieldSchema, formSchema, item) {
    var result = {
        valid: true,
        reasons: []
    };
    var validationOptions = fieldSchema.validation;

    if (validationOptions) {
        //min length
        if (validationOptions.min !== undefined) {
            if (value.length < validationOptions.min) {
                result.valid = false;
                result.reasons.push('min');
            }
        }

        //max length
        if (validationOptions.max !== undefined) {
            if (value.length > validationOptions.max) {
                result.valid = false;
                result.reasons.push('max');
            }
        }

        //type check
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
                if (!moment(value, 'DD/MM/YYYY', true).isValid()) typeValid = false;
                break;
            }

            if (!typeValid) {
                result.valid = false;
                result.reasons.push('type');
            }
        }

        //unique check
        if (validationOptions.unique) {
            var previousValue;
            var field;
            var query = {};
            var projection = {};
            var lang = FlowRouter.getParam('itemLang');

            if (fieldSchema.i18n === undefined) {
                field = lang + '.' + fieldSchema.name;
            }
            else {
                field = fieldSchema.name;
            }

            query[field] = value;
            collection = Skeletor.Data[formSchema.__collection];

            // check against document's current value (since it can be changed by user before being saved)
            // in that case that "previous value" is allowed
            if (item !== undefined) {
                projection[field] = 1;
                previousValue = collection.findOne({_id: item._id}, {fields: projection});

                if (fieldSchema.i18n === undefined) {
                    if (previousValue[lang]) {
                        previousValue = previousValue[lang][fieldSchema.name];
                    }
                    else {
                        previousValue = "";
                    }
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

    ckUtils.globalUtilities.logger(result, 'skeleform');
    return result;
};
