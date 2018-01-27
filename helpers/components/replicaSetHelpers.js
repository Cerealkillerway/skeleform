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

        // here formRendered reactive var is used to make Skeleform.utils.registerField wait for replicaSet object
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
        SkeleUtils.GlobalUtilities.logger('re-init replicaSet', 'skeleError');
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
