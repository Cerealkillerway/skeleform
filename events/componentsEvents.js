// Replica set component
Template.skeleformDefaultReplicaBtns.onCreated(function() {
    let data = this.data;

    this.replicaIndex = data.formInstance.replicaSets[data.replicaSet.name].index;
});

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
        }

        SkeleUtils.GlobalUtilities.logger('adding replica instance: ' + replicaSets[replicaSetName].index, 'skeleform');
        replicaSets[replicaSetName].instances.push({
            replicaIndex: replicaSets[replicaSetName].index,
            instance: Blaze.renderWithData(
                Template.skeleformBody,
                data,
                instance.$('.skeleformReplicaBtnsWrapper').parent().parent()[0],
                instance.$('.skeleformReplicaBtnsWrapper').parent().next()[0]
            )
        });

        instance.i++;
    },

    'click .btnRemove': function(event, instance) {
        let data = instance.data;
        let formInstance = data.formInstance;
        let replicaSets = formInstance.replicaSets;
        let replicaSetName = data.replicaSet.name;

        if (instance.replicaIndex === 1) {
            SkeleUtils.GlobalUtilities.logger('Cannot remove the first replica set for now...', 'skeleform');
            return false;
        }

        SkeleUtils.GlobalUtilities.logger('removing replica instance: ' + instance.replicaIndex, 'skeleform');
        replicaSets[replicaSetName].copies = replicaSets[replicaSetName].copies - 1;

        let instanceToRemove = _.find(replicaSets[replicaSetName].instances, function(instanceToCheck) {
            return instanceToCheck.replicaIndex === instance.replicaIndex;
        });

        Blaze.remove(instanceToRemove.instance);
    }
});
