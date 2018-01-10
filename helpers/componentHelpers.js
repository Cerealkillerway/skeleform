Template.skeleformReplicaSetWrapper.helpers(skeleformGeneralHelpers);
Template.skeleformReplicaSetWrapper.helpers({
    handleReplicaSets: function(instance) {
        let data = instance.data;
        let item = data.item;
        let replicaItems = [];

        if (!item) {
            return [];
        }

        let formInstance = data.formInstance;
        let replicaSetData = formInstance.replicaSets[data.replicaSet.name];
        let replicaFields = data.schema;

        let replicaName = data.replicaSet.name;

        if (replicaSetData.options.i18n === undefined) {
            replicaName = FlowRouter.getParam('itemLang') + '---' + replicaName;
        }

        let replicaItem = formInstance.data.item[replicaName];

        if (!replicaItem) {
            return [];
        }

        for (const replica of replicaItem) {
            replicaItems.push({
                replicaItem: replica,
                instance: instance
            });
        }

        return replicaItems;

        /*
        // hanlde replicas
        if (formInstance.data.skeleSubsReady.get()) {
            if (!formInstance.data || !formInstance.data.item) {
                return;
            }

            let replicaName = data.replicaSet.name;

            if (replicaSetData.options.i18n === undefined) {
                replicaName = FlowRouter.getParam('itemLang') + '---' + replicaName;
            }

            let replicaItem = formInstance.data.item[replicaName];

            if (!replicaItem) {
                return;
            }

            if (replicaItem.length > data.replicaIndex && replicaSetData.copies < replicaItem.length) {
                //Skeleform.addReplicaSetInstance(this, replicaSetData, replicaFields);
            }
            let $replicaContainer = $(Template.instance().firstNode).closest('.skeleformReplicaSet');

            Skeleform.handleReplicaIndexes($replicaContainer, data.schema.fields, data.formInstance.Fields);
        }*/
    }
});


Template.skeleformReplicaSet.helpers(skeleformGeneralHelpers);
