// Replica set component
function addReplicaSetInstance(instance, replicaSetData, replicaFields) {
    let data = instance.data;
    let maxCopies = replicaSetData.options.maxCopies || undefined;
    if (!instance.i) instance.i = 0;

    SkeleUtils.GlobalUtilities.logger('adding replica instance: ' + instance.replicaIndex, 'skeleform');
    // disallow removing more copies when reached the minimum
    if (maxCopies && replicaSetData.copies >= maxCopies) {
        SkeleUtils.GlobalUtilities.logger('Cannot add: reached the maximum allowed copies of this set (' + maxCopies + ')', 'skeleform');
        return false;
    }

    replicaSetData.copies = replicaSetData.copies + 1;
    replicaSetData.index = replicaSetData.index + 1;

    // the first time fields data coming from template helper must be nested one level more
    if (instance.i === 0) {
        data.schema = {
            fields: [replicaFields]
        };

        if (data.groupLevel) {
            data.groupLevel = data.groupLevel - 1;
        }
    }

    // render a new copy of the replica set
    SkeleUtils.GlobalUtilities.logger('adding replica instance: ' + replicaSetData.index, 'skeleform');
    replicaSetData.instances.push({
        replicaIndex: replicaSetData.index,
        instance: Blaze.renderWithData(
            Template.skeleformBody,
            data,
            instance.$('.skeleformReplicaBtnsWrapper').parent().parent()[0],
            instance.$('.skeleformReplicaBtnsWrapper').parent().next()[0]
        )
    });

    instance.i++;
}

Template.skeleformDefaultReplicaBtns.onCreated(function() {
    let data = this.data;

    this.replicaIndex = data.formInstance.replicaSets[data.replicaSet.name].index;
});

Template.skeleformDefaultReplicaBtns.onRendered(function() {
    let data = this.data;
    let formInstance = data.formInstance;
    let replicaSetData = formInstance.replicaSets[data.replicaSet.name];
    let replicaFields = data.schema;
    let initCopies = replicaSetData.options.initCopies;

    // if the current number of copies of the replica set is less than the required one on init
    // add one more
    if (initCopies && replicaSetData.copies < initCopies) {
        addReplicaSetInstance(this, replicaSetData, replicaFields);
    }
    // otherwise unset "initCopies" to avoid adding more than one copy when clicking "+" button
    // when initialization is finished
    else {
        replicaSetData.options.initCopies = undefined;
    }
});

Template.skeleformDefaultReplicaBtns.events({
    'click .btnAdd': function(event, instance) {
        let data = instance.data;
        let formInstance = data.formInstance;
        let replicaSetData = formInstance.replicaSets[data.replicaSet.name];
        let replicaFields = data.schema;

        addReplicaSetInstance(instance, replicaSetData, replicaFields);
    },

    'click .btnRemove': function(event, instance) {
        let data = instance.data;
        let formInstance = data.formInstance;
        let replicaSetData = formInstance.replicaSets[data.replicaSet.name];
        let minCopies = replicaSetData.options.minCopies !== undefined ? replicaSetData.options.minCopies : 1;

        SkeleUtils.GlobalUtilities.logger('removing replica instance: ' + instance.replicaIndex, 'skeleform');

        // disallow removing more copies when reached the minimum
        if (replicaSetData.copies <= minCopies) {
            SkeleUtils.GlobalUtilities.logger('Cannot remove: reached the minimum allowed copies of this set (' + minCopies + ')', 'skeleform');
            return false;
        }

        replicaSetData.copies = replicaSetData.copies - 1;

        // remove the current copy of the replica set
        if (instance.replicaIndex === 1) {
            instance.$('.skeleformReplicaBtnsWrapper').parent('.row').remove();
        }
        else {
            let instanceToRemove = _.find(replicaSetData.instances, function(instanceToCheck) {
                return instanceToCheck.replicaIndex === instance.replicaIndex;
            });

            Blaze.remove(instanceToRemove.instance);
        }
    }
});
