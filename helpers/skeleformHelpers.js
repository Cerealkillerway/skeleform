// Skeleform helpers
Template.skeleform.helpers({
    toolbarContext: function() {
        return {
            //Fields: Template.instance().Fields,
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
        let fields;

        if (context.context) {
            fields = context.context.data.schema.fields;

            if (context.context.data.replicaSet) {
                fields.forEach(function(field) {
                    field.replicaSet = context.context.data.replicaSet;
                });
            }
        }
        else {
            fields = context.schema.fields;
        }

        return fields;
    },

    isFieldInCurrentForm: function(fieldSchema) {
        let context;
        let templateInstance = Template.instance();

        if (templateInstance.data.context) {
            context = templateInstance.data.context;
        }
        else {
            context = Template.instance();
        }

        let formInstance = context.data.formInstance;
        let formData = context.data.item;
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
            groupLevel: context.data.groupLevel || 0
        };

        // data.groupLevel will contain the level of group nesting of the field
        if (fieldSchema.skeleformGroup) {
            data.groupLevel = data.groupLevel + 1;
        }

        // replica set template
        let replicaSetOptions = fieldSchema.replicaSet;

        if (replicaSetOptions) {
            console.log('ISFIELDINCURRENTFORM HELPER: ISFIELDINCURRENTFORM HELPER: ISFIELDINCURRENTFORM HELPER: ISFIELDINCURRENTFORM HELPER: ISFIELDINCURRENTFORM HELPER:');
            data.replicaSet = replicaSetOptions;
            data.replicaItem = templateInstance.data.replicaItem;
            data.replicaIndex = templateInstance.data.replicaIndex;

            let replicaSetData = formInstance.replicaSets[replicaSetOptions.name];

            // if template for replica set buttons add/remove is not supplied, use the default one
            if (!data.replicaSet.template) {
                data.replicaSet.template = 'skeleformDefaultReplicaBtns';
            }

            // initialize replicaSet object if not already defined
            if (!replicaSetData) {
                formInstance.replicaSets[replicaSetOptions.name] = {
                    copies: 0,
                    index: 0,
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
