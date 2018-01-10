import Sortable from 'sortablejs';

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
        Skeleform.handleReplicaIndexes($replicaContainer, data.schema.fields, data.formInstance.Fields);
    }
}


// Calculate positional indexes for replicaFrames
Skeleform.handleReplicaIndexes = function($replicaContainer, replicaFields, formFields) {
    $.each($replicaContainer.find('.skeleformReplicaFrame'), function(index, frame) {
        let currentIndex = index + 1 ;
        let $frame = $(frame);
        let $indexContainer = $frame.find('.replica_index');
        let oldIndex = $indexContainer.text()

        $indexContainer.html(currentIndex);


        if (oldIndex.length > 0) {
            for (const replicaField of replicaFields) {
                let name = replicaField.name;
                let oldName = name + '-' + oldIndex;
                let newName = name + '-' + currentIndex;

                $frame.find('#' + oldName).attr('id', newName);
            }
        }
    });
}


Template.skeleformReplicaSetWrapper.onRendered(function() {
    let data = this.data.data;

    if (data.replicaSet.sortable) {
        let $replicaContainer = this.$('.skeleformReplicaSet');
        let items = $replicaContainer[0];
        let sortable = Sortable.create(items, {
            animation: 150,
            draggable: '.skeleformReplicaFrame',
            filter: '.skeleValidate',
            preventOnFilter: false,
            onEnd: function(event) {
                Skeleform.handleReplicaIndexes($replicaContainer, data.schema.fields, data.formInstance.Fields);
            }
        });
    }
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
    let $replicaContainer = $(this.firstNode).closest('.skeleformReplicaSet');


    // if the current number of copies of the replica set is less than the required one on init
    // add one more
    if (initCopies && replicaSetData.copies < initCopies) {
        //Skeleform.addReplicaSetInstance(this, replicaSetData, replicaFields);
    }
    // otherwise unset "initCopies" to avoid adding more than one copy when clicking "+" button
    // when initialization is finished
    else {
        replicaSetData.options.initCopies = undefined;
    }
});

Template.skeleformDefaultReplicaBtns.events({
    'click .skeleReplicaBtnAdd': function(event, instance) {
        let data = instance.data;
        let formInstance = data.formInstance;
        let replicaSetData = formInstance.replicaSets[data.replicaSet.name];
        let replicaFields = data.schema;

        Skeleform.addReplicaSetInstance(instance, replicaSetData, replicaFields);
    },

    'click .skeleReplicaBtnRemove': function(event, instance) {
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

        Skeleform.handleReplicaIndexes($replicaContainer, data.schema.fields, data.formInstance.Fields);
    }
});
