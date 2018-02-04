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

        context.fields = instance.fields;
        context.formRendered = instance.formRendered;
        context.skeleDebug = instance.skeleDebug;
        context.plugins = instance.plugins;
        context.replicaVars = instance.replicaVars;
        context.replicas = instance.replicas;
        context.autoSaves = instance.autoSaves;

        let dataContext = {
            formContext: context,
            fieldSchema: context.schema
        };

        return dataContext;
    }
});


// skeleform body helpers
Template.skeleformBody.helpers({
    fields: function(context) {
        let fields = context.fieldSchema.fields
        let currentFields = [];
        let item = context.formContext.item;

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
                    if (item === undefined) {
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
    },

    formatClasses: skeleformStyleHelpers.formatClasses,

    setId: skeleformStyleHelpers.setId
});


Template.skeleformField.helpers({
    createDataForField: function(context) {
        context.fieldSchema = new ReactiveVar(context.fieldSchema);

        return context;
    }
});
