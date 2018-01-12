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
    fields: function(context) {
        const instance = Template.instance();
        let fields;

        if (context.instance) {
            fields = context.instance.data.schema.fields;

            if (context.instance.data.replicaSet) {
                fields.forEach(function(field) {
                    field.replicaSet = context.instance.data.replicaSet;
                    field.replicaItem = instance.replicaItem;
                    field.replicaIndex = instance.replicaIndex;
                });
            }
        }
        else {
            fields = context.schema.fields;
        }


        return fields;
    },

    isFieldInCurrentForm: function(fieldSchema) {
        let instance = Template.instance();

        if (instance.data.instance) {
            instance = instance.data.instance;
        }

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
        if (fieldSchema.skeleformGroup) {            let index = 1;

            data.groupLevel = data.groupLevel + 1;
        }

        // replica set template
        let replicaSetOptions = fieldSchema.replicaSet;

        if (replicaSetOptions) {
            data.replicaSet = replicaSetOptions;
            data.replicaItem = Template.instance().data.replicaItem;
            data.replicaIndex = Template.instance().data.replicaIndex;

            let replicaSetData = formInstance.replicaSets[replicaSetOptions.name];

            // if template for replica set buttons add/remove is not supplied, use the default one
            if (!data.replicaSet.template) {
                data.replicaSet.template = 'skeleformDefaultReplicaBtns';
            }

            // initialize replicaSet object if not already defined
            if (!replicaSetData) {
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
        if (Array.isArray(classes)) {
            return classes.join(' ');
        }
        return classes;
    }
});


Template.skeleformField.helpers({
    createDataForField: function(data) {
        data.schema = new ReactiveVar(data.schema);

        return data;
    }
})


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
