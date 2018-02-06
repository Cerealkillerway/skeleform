Template.skeleformReplicaSetWrapper.helpers(skeleformGeneralHelpers);
Template.skeleformReplicaSetWrapper.helpers({
    handleReplicaSets: function(context) {
        let data = context.data;
        let item = data.item;
        let replicaItems = [];
        let formInstance = data.formInstance;
        let replicaSetData = formInstance.replicaSets[data.replicaSet.name];
        let replicaFields = data.schema;
        let replicaName = data.replicaSet.name;
        let replicaData = formInstance.replicaSets[replicaName];
        let index = 0;

        // here replicasReady reactive var is used to make Skeleform.utils.registerField wait for replicaSet object
        // to be initialized
        formInstance.replicasReady.set(false);

        function initReplicaSet() {
            let items= [];

            while (replicaItems.length < replicaSetData.options.minCopies) {
                index ++;
                replicaData.copies = index;
                replicaData.index = index;

                replicaItems.push({
                    replicaItem: {},
                    replicaIndex: index,
                    context: context,
                    Fields: []
                });
            }

            replicaData.instances = replicaItems;
            return replicaItems;
        }

        if (!item) {
            return initReplicaSet();
        }

        if (replicaSetData.options.i18n === undefined) {
            replicaName = FlowRouter.getParam('itemLang') + '---' + replicaName;
        }

        let replicaItem = formInstance.data.item[replicaName];

        if (!replicaItem) {
            return initReplicaSet();
        }

        for (const replica of replicaItem) {
            index ++;
            replicaData.copies = index;
            replicaData.index = index;

            replicaItems.push({
                replicaItem: replica,
                replicaIndex: index,
                context: context,
                Fields: []
            });
        }

        formInstance.replicasReady.set(true);
        return initReplicaSet();
    },

    createReplicaContext: function(context) {
        let replicaOptions = context.fieldSchema.replicaSet;
        let formContext = context.formContext;
        let item = formContext.item;
        let replicaName = replicaOptions.name
        let replicas = [];
        let replicaItem;
        let replicaIndex = 0;

        if (replicaOptions.i18n === undefined || replicaOptions.i18n === true) {
            replicaName = FlowRouter.getParam('itemLang') + '---' + replicaName;
        }

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


        if (formContext.replicaVars[replicaName].get() === true) {
            replicaIndex = 0

            for (replica of formContext.replicas[replicaName]) {
                replica.replicaIndex = replicaIndex;
                replicaIndex++;
            }

            Tracker.afterFlush(() => {
                if (formContext.item) {
                    formContext.replicaVars[replicaName].set(false);
                }
                formContext.isRestoringData = false;
            });

            return formContext.replicas[replicaName];
        }

        // here should not rely on items
        // replica instances should be based on an indipendent array (like formContext.replicas);
        // if item is defined, item and formContext.replicas should be

        formContext.replicas[replicaName] = replicas;
        return replicas;
    },

    formatClasses: skeleformStyleHelpers.formatClasses
});


Template.skeleformReplicaFrame.helpers({
    formatClasses: skeleformStyleHelpers.formatClasses
});
