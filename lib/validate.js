//single value check
isValid = function(value, options, collection, documentId) {
    var result = {
        valid: true,
        reasons: []
    };
    var length;
    var jsType = typeof(value);

    //min lenght
    if (options.min !== undefined) {
        //in case of object, length is relative to the number of its properties
        if (jsType.toLowerCase() === 'object') length = objectLength(value);
        else {
            //in case of editor -> strip out html tags to evaluate content's length
            if (options.output.toLowerCase() === "editor") length = value.replace(/<(?:.|\n)*?>/gm, '').length;
            else length = value.length;
        }

        if (length < options.min) {
            result.valid = false;
            result.reasons.push('min');
        }
    }

    //max length
    if (options.max !== undefined) {
        //in case of object, length is relative to the number of its properties
        if (jsType.toLowerCase() === 'object') length = objectLength(value);
        else {
            //in case of editor -> strip out html tags to evaluate content's length
            if (options.output.toLowerCase() === "editor") length = value.replace(/<(?:.|\n)*?>/gm, '').length;
            else length = value.length;
        }

        if (length > options.max) {
            result.valid = false;
            result.reasons.push('max');
        }
    }

    //type check
    if (options.type !== undefined) {
        var typeValid = true;
        var regex;
        switch (options.type.toLowerCase()) {
            case 'text':
            if (typeof(value) !== "string") typeValid = false;
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
    if (options.unique) {
        var previousValue;
        var field;
        var query = {};
        var projection = {};
        var lang = FlowRouter.getParam('itemLang');

        if (options.i18n === undefined) {
            field = lang + '.' + options.name;
        }
        else {
            field = options.name;
        }

        query[field] = value;

        collection = Skeletor.Data[collection];

        // check against document's current value (since it can be changed by user before being saved)
        // in that case that "previous value" is allowed
        if (documentId !== undefined) {
            projection[field] = 1;
            previousValue = collection.findOne({_id: documentId}, {fields: projection});

            if (options.i18n === undefined) {
                if (previousValue[lang]) {
                    previousValue = previousValue[lang][options.name];
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

    return result;
};
