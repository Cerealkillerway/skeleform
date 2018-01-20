// Skeleform helpers
Template.skeleform.helpers({
    toolbarContext: function() {
        return {
            //Fields: Template.instance().Fields,
            formContext: Template.instance().data
        };
    },
    isDataReady: function(context) {
        if (context.skeleSubsReady.get() === false) {
            return false;
        }
        return true;
    },
    formContext: function(context) {
        let instance = Template.instance();

        context.formRendered = instance.formRendered;
        context.skeleDebug = instance.skeleDebug;
        context.formContext = context;
        context.fieldSchema = context.schema;

        return context;
    }
});


// skeleform body helpers
Template.skeleformBody.helpers({
    fields: function(context) {
        let fields = context.fieldSchema.fields
        let currentFields = [];

        function createFieldContext(fieldSchema) {
            return {
                formContext: context.formContext,
                fieldSchema: fieldSchema,
                template: fieldSchema.output ? 'skeleform' + fieldSchema.output.capitalize() : null,
                skeleformGroupLevel: context.skeleformGroupLevel || 0
            }
        }

        // create array of fields to display
        fields.forEach(function(fieldSchema) {
            if (fieldSchema.output !== 'none') {
                switch (fieldSchema.showOnly) {
                    case 'create':
                    if (!formData) {
                        currentFields.push(createFieldContext(fieldSchema));
                    }
                    break;

                    case 'update':
                    if (formData) {
                        currentFields.push(createFieldContext(fieldSchema));
                    }
                    break;

                    default:
                    currentFields.push(createFieldContext(fieldSchema));
                }
            }
        });

        return currentFields;
    },


    formatClasses: function(classes) {
        if (Array.isArray(classes)) {
            return classes.join(' ');
        }
        return classes;
    }
});


Template.skeleformGroupWrapper.helpers({
    createFieldContext: function(context) {
        context.skeleformGroupLevel++;

        return context
    }
});


Template.skeleformField.helpers({
    createDataForField: function(context) {
        context.fieldSchema = new ReactiveVar(context.fieldSchema);

        return context;
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
