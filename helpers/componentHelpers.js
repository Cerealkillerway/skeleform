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

        // here formRendered reactive var is used to make registerField wait for replicaSet object
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
    }
});


Template.skeleformReplicaSet.helpers(skeleformGeneralHelpers);
