// Replica set component
Skeleform.addReplicaSetInstance = function(instance, replicaSetData, replicaFields) {
    let data = instance.data;
    let maxCopies = replicaSetData.options.maxCopies || undefined;
    let $firstNode = $(instance.firstNode);
    let $replicaContainer = $firstNode.closest('.skeleformReplicaSet');

    // disallow adding more copies when reached the maximum
    if (maxCopies && replicaSetData.copies >= maxCopies) {
        Materialize.toast(TAPi18n.__('maxReplicaCopies_error', maxCopies), 5000, 'error');
        SkeleUtils.GlobalUtilities.logger('Cannot add: reached the maximum allowed copies of this set (' + maxCopies + ')', 'skeleform');
        return false;
    }

    replicaSetData.copies = replicaSetData.copies + 1;
    replicaSetData.index = replicaSetData.index + 1;

    // render a new copy of the replica set

    SkeleUtils.GlobalUtilities.logger('adding replica instance: ' + replicaSetData.index, 'skeleform');
    replicaSetData.instances.push({
        replicaIndex: replicaSetData.index,
        instance: Blaze.renderWithData(
            Template.skeleformReplicaSet,
            {data: data},
            $replicaContainer[0],
            $firstNode.closest('.skeleformReplicaFrame').next()[0]
        )
    });

    if (replicaSetData.options.indexes) {
        Skeleform.handleReplicaIndexes($replicaContainer);
    }
}

// Calculate positional indexes for replicaFrames
Skeleform.handleReplicaIndexes = function($replicaContainer) {
    $.each($replicaContainer.find('.skeleformReplicaFrame'), function(index, frame) {
        $(frame).find('.replica_index').html(index + 1);
    });
}


Template.skeleformReplicaSet.onRendered(function() {
    //console.log(this.data);
});


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

    this.autorun(() => {

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

            if (replicaItem.length > this.replicaIndex && replicaSetData.copies < replicaItem.length) {
                Skeleform.addReplicaSetInstance(this, replicaSetData, replicaFields);
            }
        }

    });

    // if the current number of copies of the replica set is less than the required one on init
    // add one more
    if (initCopies && replicaSetData.copies < initCopies) {
        Skeleform.addReplicaSetInstance(this, replicaSetData, replicaFields);
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

        Skeleform.addReplicaSetInstance(instance, replicaSetData, replicaFields);
    },

    'click .btnRemove': function(event, instance) {
        let data = instance.data;
        let formInstance = data.formInstance;
        let replicaSetData = formInstance.replicaSets[data.replicaSet.name];
        let minCopies = replicaSetData.options.minCopies !== undefined ? replicaSetData.options.minCopies : 1;
        let $firstNode = $(instance.firstNode);
        let $replicaContainer = $firstNode.closest('.skeleformReplicaSet');

        SkeleUtils.GlobalUtilities.logger('removing replica instance: ' + instance.replicaIndex, 'skeleform');

        // disallow removing more copies when reached the minimum
        if (replicaSetData.copies <= minCopies) {
            Materialize.toast(TAPi18n.__('minReplicaCopies_error', minCopies), 5000, 'error');
            SkeleUtils.GlobalUtilities.logger('Cannot remove: reached the minimum allowed copies of this set (' + minCopies + ')', 'skeleform');
            return false;
        }

        replicaSetData.copies = replicaSetData.copies - 1;

        // remove the current copy of the replica set
        if (instance.replicaIndex === 1) {
            $(instance.firstNode).closest('.skeleformReplicaFrame').remove();
        }
        else {
            let instanceToRemove = _.find(replicaSetData.instances, function(instanceToCheck) {
                return instanceToCheck.replicaIndex === instance.replicaIndex;
            });

            Blaze.remove(instanceToRemove.instance);
        }

        Skeleform.handleReplicaIndexes($replicaContainer);
    }
});
