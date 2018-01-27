// Skeleform helpers
Template.skeleform.helpers({
    toolbarContext: function() {
        return {
            //Fields: Template.instance().Fields,
            formContext: Template.instance().data
        };
    },
    formContext: function(context) {
        let instance = Template.instance();
        let dataContext = {};

        dataContext.formContext = context;
        dataContext.fieldSchema = context.schema;
        dataContext.formContext.fields = instance.fields;
        dataContext.formContext.formRendered = instance.formRendered;
        dataContext.formContext.skeleDebug = instance.skeleDebug;
        dataContext.formContext.plugins = instance.plugins;

        return dataContext;
    }
});


// skeleform body helpers
Template.skeleformBody.helpers({
    fields: function(context) {
        let fields = context.fieldSchema.fields
        let currentFields = [];
        let item = context.item;

        function createFieldContext(fieldSchema) {
            if (fieldSchema.replicaSet) {
                if (fieldSchema.replicaSet.wrapperTemplate === undefined) {
                    fieldSchema.replicaSet.wrapperTemplate = 'skeleformReplicaSetWrapper';
                }
            }

            let fieldContext = {
                formContext: context.formContext,
                fieldSchema: fieldSchema,
                template: fieldSchema.output ? 'skeleform' + fieldSchema.output.capitalize() : null,
                skeleformGroupLevel: context.skeleformGroupLevel || 0
            }

            if (context.replicaIndex !== undefined) {
                fieldContext.replicaIndex = context.replicaIndex;
                fieldContext.replicaOptions = context.replicaOptions;
            }

            return fieldContext;
        }

        // create array of fields to display
        fields.forEach(function(fieldSchema) {
            if (fieldSchema.output !== 'none') {
                switch (fieldSchema.showOnly) {
                    case 'create':
                    if (!item) {
                        currentFields.push(createFieldContext(fieldSchema));
                    }
                    break;

                    case 'update':
                    if (item) {
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

    formatClasses: skeleformStyleHelpers.formatClasses
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
});
