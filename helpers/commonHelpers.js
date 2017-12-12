// standard function to get a field's value form the current data object;
// it is defined here as a global function so that special field types can override "fieldValue" helper
// but still call this function if needed and then perform any special handling that is required
SkeleformStandardFieldValue = function(data, schema, instance) {
    if (data === undefined) return;

    let name = schema.name;

    if (instance.replicaIndex) {
        let replicaSetOptions = instance.data.replicaSet;
        name = replicaSetOptions.name;

        if (replicaSetOptions.i18n === undefined) {
            name = FlowRouter.getParam('itemLang') + '---' + name;
        }

        if (!data[name] || !data[name][instance.replicaIndex - 1]) {
            return;
        }

        let replicaData = data[name];

        data = replicaData[instance.replicaIndex - 1][schema.name];
    }
    else {
        if (schema.i18n === undefined) {
            data = data[FlowRouter.getParam('itemLang') + '---' + name];

            if (data === undefined) return '';
        }
        else {
            data = data[name];
        }
    }

    // set active class on label to avoid overlapping
    if (schema.output === 'input') {
        $('#' + schema.name).next('label').addClass('active');
    }

    return data;
};


// invoke a specific callback for a field
InvokeCallback = function(instance, value, schema, type) {
    if (schema.callbacks) {
        switch (type) {
            case 'onCreated':
            // if defined, perform the callback
            if (schema.callbacks.onCreated) {
                schema.callbacks.onCreated(instance);
            }
            break;

            case 'onChange':
            // if defined, perform the callback
            if (schema.callbacks.onChange) {
                schema.callbacks.onChange(value, instance);
            }
            break;
        }
    }
};

function createFieldId(instance, name, isSelecting) {
    let replicaIndex = instance.replicaIndex;

    if (isSelecting) {
        name = name.replace('.', '\\.');
    }

    if (replicaIndex) {
        return name + '-' + replicaIndex;
    }

    return name;
}

// get the field's object
$getFieldById = function(instance, schema) {
    return instance.$('#' + createFieldId(instance, schema.name, true));
};
// get the field' shadow object
$getShadowFieldId = function(instance, schema) {
    return instance.$('#' + schema.name.replace('.', '\\.') + 'ShadowConfirm');
};

// standard function to set the value on a field;
// it waits for any custom initialization on the field, and reactively watch lang changes
// and fires appropriate i18n method on the field is special handling for i18n is required
setFieldValue = function(instance, data, schema) {
    instance.view.autorun(function() {
        // register dependency from current language; used to fire custom i18n callback
        // for fields that requires special i18n treatment...
        let currentLang = TAPi18n.getLanguage();
        let formRendered = instance.data.formInstance.formRendered.get();

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
            if (!instance.data.formInstance.data.skeleSubsReady.get()) {
                return false;
            }
            let value = SkeleformStandardFieldValue(data, schema, instance);

            //console.log(value);
            //console.log(instance.getValue());

            //SkeleUtils.GlobalUtilities.logger(schema.name + '-value: ' + value, 'skeleformCommon');
            //SkeleUtils.GlobalUtilities.logger(schema.name + '-getValue(): ' + instance.getValue(), 'skeleformCommon');
            //SkeleUtils.GlobalUtilities.logger('------------------', 'skeleformCommon');

            /*if (value === undefined || value === null) {
                value = '';
            }*/

            if (value !== instance.getValue()) {
                instance.setValue(value);
                instance.isValid();
                instance.isValidated = true;

            }
            else {
                // if the field has not been validated, validate it now!
                if (!instance.isValidated) {
                    instance.isValidated = true;
                    instance.isValid();
                }
            }

            // call custom i18n if necessary
            if (instance.i18n) {
                instance.i18n(currentLang);
            }
        }
    });
};


// create paths for redirect after form actions
createPath = function(path, data) {
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
    templateInstance: function() {
        return Template.instance();
    },
    label: function(name, options) {
        name = name.split('.');

        for (i = 1; i < name.length; i++) {
            name[i] = name[i].capitalize();
        }
        name = name.join('');

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
        return createFieldId(Template.instance(), name);
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
    fieldValue: function(template) {
        let data = template.data;

        setFieldValue(template, data.item, data.schema);
    }
};


toolbarsHelpers = {
    makeUndoPath: function(path) {
        let params = createPath(path);
        return FlowRouter.path(path[0], params.params, {lang: TAPi18n.getLanguage()});
    }
};
