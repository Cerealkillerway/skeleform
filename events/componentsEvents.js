import Sortable from 'sortablejs';


// Calculate positional indexes for replicaFrames
Skeleform.handleReplicaIndexes = function(instance, context, event) {
    let newIndex = event.newIndex;
    let oldIndex = event.oldIndex;
    let item = context.formContext.item;
    let replicaOptions = context.fieldSchema.replicaSet;
    let replicaName = replicaOptions.name;
    let $replicaContainer = $(instance.firstNode).closest('.skeleformReplicaSet');
    let $replicas = $replicaContainer.find('.skeleformReplicaFrame');

    SkeleUtils.GlobalUtilities.logger('Replica indexes handler: [' + replicaName + '] moved replica #' + oldIndex + ' to #' + newIndex, 'skelePlugin');

    for (replica of $replicas) {
        let $replica = $(replica);
        let index = $replicas.index($replica);

        $replica.find('.skeleformReplicaIndex').text(index + 1);
    }
}


Template.skeleformReplicaSetWrapper.onRendered(function() {
    let instance = this;
    let data = instance.data;
    let replicaOptions = data.fieldSchema.replicaSet;

    if (replicaOptions.sortable) {
        let $replicaContainer = this.$('.skeleformReplicaSet');
        let items = $replicaContainer[0];
        data.formContext.plugins.sortables[replicaOptions.name] = Sortable.create(items, {
            animation: 150,
            draggable: '.skeleformReplicaFrame',
            filter: '.skeleValidate',
            preventOnFilter: false,
            scroll: true,
            handle: '.skeleformReplicaHandle',
            onEnd: function(event) {
                Skeleform.handleReplicaIndexes(instance, data, event);
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

        formInstance.data.item['it---' + data.replicaSet.name].push([]);
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
