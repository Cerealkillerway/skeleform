createPath = function(path, data) {
    var params = {};

    _.keys(path[1]).forEach(function(param) {
        switch (param) {
            case 'itemLang':
            params[param] = FlowRouter.getParam('itemLang');
            break;

            default:
            if (path[1][param] === 'this') {
                if (data[param]) {
                    params[param] = data[param];
                }
                else {
                    params[param] = data[FlowRouter.getParam('itemLang')][param];
                }
            }
            else {
                params[param] = path[1][param];
            }
        }
    });
    return params;
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
    fieldValue: function(data, schema) {
        var name = schema.name;

        if (!data) return;

        if (schema.i18n === undefined) {
            data = data[FlowRouter.getParam('itemLang')];
            if (!data) return;
        }

        var pathShards = name.split('.');

        pathShards.forEach(function(shard, index) {
            data = data[shard];
        });

        return data;
    }
};


toolbarsHelpers = {
    makeUndoPath: function(path) {
        var params = createPath(path);

        return FlowRouter.path(path[0], params, {lang: FlowRouter.getQueryParam("lang")});
    }
};
