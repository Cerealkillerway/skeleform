// standard function to get a field's value; it is defined here as a global function so that
// special field types can override "fieldValue" helper but still call this function if needed
// and then perform any special handling that is required
SkeleformStandardFieldValue = function(data, schema) {
    var name = schema.name;

    if (data === undefined) return;

    if (schema.i18n === undefined) {
        data = data[FlowRouter.getParam('itemLang') + '---' + name];
        if (data === undefined) return;
    }
    else {
        name.split('.').forEach(function(nameShard, index) {
            data = data[nameShard];
        });
    }

    // set active class on label to avoid overlapping
    if (schema.output === 'input') {
        $('#' + schema.name).next('label').addClass('active');
    }
    return data;
};

// invoke a specific callback for a field
InvokeCallback = function(value, schema, type) {
    switch (type) {
        case 'onChange':
        // if defined, perform the callback
        if (schema.callbacks && schema.callbacks.onChange) {
            schema.callbacks.onChange(value);
        }
    }
};

// get the field's object
$getField = function(template, schema) {
    return template.$('#' + schema.name.replace('.', '\\.'));
};


createPath = function(path, data) {
    var result = {
        params: {},
        queryParams: {}
    };
    var value;

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
                if (data[param]) {
                    result[type][param] = data[param];
                }
                else {
                    result[type][param] = data[FlowRouter.getParam('itemLang') + '---' + param];
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

//helpers used by form elements
skeleformGeneralHelpers = {
    label: function(name, options) {
        name = name.substring(name.lastIndexOf('.') + 1, name.length);

        switch(options) {
            case 'shadowConfirm':
            return TAPi18n.__(name + 'ShadowConfirm_lbl');

            case 'title':
            return TAPi18n.__(name + '_title');

            default:
            return TAPi18n.__(name + '_lbl');
        }
    },
    field: function(name) {
        return name;
    },
    required: function() {
        if ((this.schema.validation && this.schema.validation.min !== undefined) || this.schema.validation && this.schema.validation.type === 'date') return ' *';
        return '';
    },
    fieldStyle: function(context) {
        if (context.icon || context.unit) return 'float: left;';

        return '';
    },
    fieldSize: function(size) {
        if (!size) return 's12 m6';
        return size;
    },
    // sets the value on the field, used by most field types
    fieldValue: function(data, schema) {
        return SkeleformStandardFieldValue(data, schema);
    }
};


toolbarsHelpers = {
    makeUndoPath: function(path) {
        var params = createPath(path);

        return FlowRouter.path(path[0], params.params, {lang: FlowRouter.getQueryParam("lang")});
    }
};
