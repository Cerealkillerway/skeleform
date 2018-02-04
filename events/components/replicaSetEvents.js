import Sortable from 'sortablejs';


// Calculate positional indexes for replicaFrames
Skeleform.handleReplicaIndexes = function(instance, context) {
    let $replicaContainer = $(instance.firstNode).closest('.skeleformReplicaSet');
    let $replicas = $replicaContainer.find('.skeleformReplicaFrame');

    for (replica of $replicas) {
        let $replica = $(replica);
        let index = $replicas.index($replica);

        $replica.find('.skeleformReplicaIndex').text(index + 1);
    }
}


Template.skeleformReplicaSetWrapper.onCreated(function() {
    let data = this.data;
    let formContext = data.formContext;
    let replicaOptions = data.fieldSchema.replicaSet;
    let replicaName = replicaOptions.name;

    if (replicaOptions.i18n === undefined || replicaOptions.i18n === true) {
        replicaName = FlowRouter.getParam('itemLang') + '---' + replicaName;
    }

    formContext.replicaVars[replicaName] = new ReactiveVar(false);
});


Template.skeleformReplicaSetWrapper.onRendered(function() {
    let instance = this;
    let data = instance.data;
    let replicaOptions = data.fieldSchema.replicaSet;
    let formContext = data.formContext;
    let replicaName = replicaOptions.name;

    if (replicaOptions.i18n === undefined || replicaOptions.i18n === true) {
        replicaName = FlowRouter.getParam('itemLang') + '---' + replicaName;
    }

    if (replicaOptions.sortable) {
        let $replicaContainer = this.$('.skeleformReplicaSet');
        let items = $replicaContainer[0];
        let sortableOptions = {
            animation: 150,
            draggable: '.skeleformReplicaFrame',
            filter: '.skeleValidate',
            preventOnFilter: false,
            scroll: true,
            handle: '.skeleformReplicaHandle',
            onEnd: function(event) {
                Skeleform.handleReplicaIndexes(instance, data);
            }
        }

        if (typeof replicaOptions.sortable === 'object') {
            sortableOptions = _.extend(sortableOptions, replicaOptions.sortable);
        }

        formContext.plugins.sortables[replicaName] = Sortable.create(items, sortableOptions);
    }
});


Template.skeleformDefaultReplicaBtns.events({
    'click .skeleReplicaBtnAdd': function(event, instance) {
        let data = instance.data;
        let $replicaContainer = $(instance.firstNode).closest('.skeleformReplicaSet');
        let $currentReplicaFrame = $(instance.firstNode).closest('.skeleformReplicaFrame')
        let newReplicaIndex = $replicaContainer.find('.skeleformReplicaFrame').length + 1;
        let insertionIndex = $replicaContainer.find('.skeleformReplicaFrame').index($currentReplicaFrame) + 1;
        let formContext = data.formContext;
        let replicaOptions = data.replicaOptions;
        let replicaName = replicaOptions.name;
        let newReplicaItem = {
            formContext: formContext,
            replicaOptions: replicaOptions,
            fieldSchema: data.fieldSchema
        }

        if (replicaOptions.i18n === undefined || replicaOptions.i18n === true) {
            replicaName = FlowRouter.getParam('itemLang') + '---' + replicaName;
        }

        formContext.replicaVars[replicaName].set(false);

        if (formContext.item) {
            formContext.item[replicaName].insertAt(newReplicaItem, insertionIndex);
        }

        formContext.replicas[replicaName].insertAt(newReplicaItem, insertionIndex);
        formContext.replicaVars[replicaName].set(true);

        // save form status
        Skeleform.utils.autoSaveFormData(formContext, formContext.fields);
    },

    'click .skeleReplicaBtnRemove': function(event, instance) {
        let data = instance.data;
        let $replicaContainer = $(instance.firstNode).closest('.skeleformReplicaSet');
        let $currentReplicaFrame = $(instance.firstNode).closest('.skeleformReplicaFrame')
        let deletionIndex = $replicaContainer.find('.skeleformReplicaFrame').index($currentReplicaFrame);
        let formContext = data.formContext;
        let replicaOptions = data.replicaOptions;
        let replicaName = data.replicaOptions.name;

        if (replicaOptions.i18n === undefined || replicaOptions.i18n === true) {
            replicaName = FlowRouter.getParam('itemLang') + '---' + replicaName;
        }

        formContext.replicaVars[replicaName].set(false);

        if (formContext.item) {
            formContext.item[replicaName].removeAt(deletionIndex);
        }

        formContext.replicas[replicaName].removeAt(deletionIndex);
        formContext.replicaVars[replicaName].set(true);

        // save form status
        Skeleform.utils.autoSaveFormData(formContext, formContext.fields);
    }
});
