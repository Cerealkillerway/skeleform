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


Template.skeleformReplicaSetWrapper.helpers({
    createReplicaContext: function(context) {
        let replicaOptions = context.fieldSchema.replicaSet;
        let formContext = context.formContext;
        let item = formContext.item;
        let replicaName = replicaOptions.name
        let replicas = [];
        let replicaItem;
        let replicaIndex = 0;

        if (formContext.formRendered.get() === true) {
            function insertReplicaItem() {
                let replicaContext = {};

                _.extend(replicaContext, context);
                replicaContext.replicaIndex = replicaIndex;
                replicaContext.replicaOptions = replicaOptions;
                replicas.push(replicaContext);

                replicaIndex++;
            }

            if (item) {
                if (replicaOptions.i18n === undefined || replicaOptions.i18n === true) {
                    replicaName = FlowRouter.getParam('itemLang') + '---' + replicaName;
                }

                replicaItem = item[replicaName];

                if (replicaItem) {
                    for (item of replicaItem) {

                        insertReplicaItem();
                    }
                }
            }
            // add missing copies to reach minimum required
            while (replicas.length < replicaOptions.minCopies) {
                insertReplicaItem();
            }
        }

        return replicas;
    },

    formatClasses: skeleformStyleHelpers.formatClasses
});


Template.skeleformReplicaFrame.helpers({
    formatClasses: skeleformStyleHelpers.formatClasses
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
