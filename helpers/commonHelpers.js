SkeleformStandardFieldValue = function(data, schema) {
    var name = schema.name;

    if (!data) return;

    if (schema.i18n === undefined) {
        data = data[FlowRouter.getParam('itemLang') + '---' + name];
        if (!data) return;
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
        if (this.schema.min !== undefined) return ' *';
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
