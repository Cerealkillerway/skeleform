// Replica set component
Template.skeleformDefaultReplicaBtns.events({
    'click .btnAdd': function(event, instance) {
        let data = instance.data;
        let formInstance = data.formInstance;
        let replicaSets = formInstance.replicaSets;
        let replicaSetName = data.replicaSet.name;
        let replicaFields = data.schema;
        if (!instance.i) instance.i = 0;

        replicaSets[replicaSetName].copies = replicaSets[replicaSetName].copies + 1;
        replicaSets[replicaSetName].index = replicaSets[replicaSetName].index + 1;
        
        if (instance.i === 0) {
            data.schema = {
                fields: [replicaFields]
            };

            if (data.groupLevel) {
                data.groupLevel = data.groupLevel - 1;
            }

            data.replicaIndex = replicaSets[replicaSetName].index;
        }

        Blaze.renderWithData(Template.skeleformBody, data, $('.skeleformFields')[0]);
        instance.i++;

    },

    'click .btnRemove': function(event, instance) {
        let formInstance = instance.data.formInstance;
        let replicaSets = formInstance.replicaSets;
        let replicaSetName = instance.data.replicaSet.name;
        let fields = formInstance.data.schema.fields;

        //formInstance.formRerender.set('true');

        replicaSets[replicaSetName].copies = replicaSets[replicaSetName].copies - 1;
    }
});
