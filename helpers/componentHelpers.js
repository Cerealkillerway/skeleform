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
        formInstance.formRendered.set(false);

        function initReplicaSet() {
            let items= [];

            while (replicaItems.length < replicaSetData.options.minCopies) {
                index ++;
                replicaData.copies = index;
                replicaData.index = index;

                replicaItems.push({
                    replicaItem: {},
                    replicaIndex: index,
                    instance: context,
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
                instance: context,
                Fields: []
            });
        }

        formInstance.formRendered.set(true);
        return initReplicaSet();
    }
});


Template.skeleformReplicaSet.helpers(skeleformGeneralHelpers);
