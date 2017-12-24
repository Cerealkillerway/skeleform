// Skeleform helpers
Template.skeleform.helpers({
    toolbarContext: function() {
        return {
            Fields: Template.instance().Fields,
            formContext: Template.instance().data
        };
    },
    generalContext: function() {
        let data = Template.instance().data;

        data.formInstance = Template.instance();
        return data;
    }
});


// skeleform body helpers
Template.skeleformBody.helpers({
    fields: function(fields) {
        const instance = Template.instance();

        if (instance.data.replicaSet) {
            fields.forEach(function(field) {
                field.replicaSet = instance.data.replicaSet;
            });
        }
        return fields;
    },

    isFieldInCurrentForm: function(fieldSchema) {
        const instance = Template.instance();
        let formInstance = instance.data.formInstance;
        let formData = instance.data.item;
        let data;

        // skip fields that have not to be displayed in form
        if (fieldSchema.output === 'none') {
            return false;
        }

        switch (fieldSchema.showOnly) {
            case 'create':
            if (formData) {
                return false;
            }
            break;

            case 'update':
            if (!formData) {
                return false;
            }
            break;
        }

        data = {
            formInstance: formInstance,
            schema: fieldSchema,
            item: formData,
            groupLevel: instance.data.groupLevel || 0
        };

        // data.groupLevel will contain the level of group nesting of the field
        if (fieldSchema.skeleformGroup) {
            data.groupLevel = data.groupLevel + 1;
        }

        // replica set template
        let replicaSetOptions = fieldSchema.replicaSet;

        if (replicaSetOptions) {
            data.replicaSet = replicaSetOptions;

            // if template for replica set buttons add/remove is not supplied, use the default one
            if (!data.replicaSet.template) {
                data.replicaSet.template = 'skeleformDefaultReplicaBtns';
            }

            // initialize replicaSet object if not already defined
            if (!formInstance.replicaSets[replicaSetOptions.name]) {
                formInstance.replicaSets[replicaSetOptions.name] = {
                    copies: 1,
                    index: 1,
                    instances: [],
                    options: replicaSetOptions
                };
            }
        }

        return {
            template: fieldSchema.output ? 'skeleform' + fieldSchema.output.capitalize() : null,
            data: data
        };
    },

    formatClasses: function(classes) {
        return classes ? classes.join(' ') : '';
    }
});


// update buttons (toolbar)
Template.skeleformUpdateButtons.helpers({
    isTranslatable: function() {
        if (FlowRouter.getParam('itemLang')) {
            return true;
        }
        return false;
    }
});


// Toolbars
Template.skeleformCreateButtons.helpers(toolbarsHelpers);
Template.skeleformUpdateButtons.helpers(toolbarsHelpers);


// SkeleformLangBar
Template.skeleformLangBar.helpers({
    langs: function() {
        let result = [];

        if (Skeletor.configuration) {
            _.each(Skeletor.configuration.langEnable, function(value, key) {
                if (value) {
                    result.push(key);
                }
            });

            return result;
        }
    },
    isActive: function(buttonLang) {
        if (FlowRouter.getParam('itemLang') === buttonLang) {
            return 'active';
        }
    }
});
