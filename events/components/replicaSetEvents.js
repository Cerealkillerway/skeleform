import Sortable from 'sortablejs';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


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

        if (replicaOptions.i18n === undefined || replicaOptions.i18n === true) {
            replicaName = FlowRouter.getParam('itemLang') + '---' + replicaName;
        }

        if (formContext.replicas[replicaName].length >= replicaOptions.maxCopies) {
            Materialize.toast(TAPi18n.__('maxReplicaCopies_error', replicaOptions.maxCopies), 5000, 'error');
            SkeleUtils.GlobalUtilities.logger('Tried to add more replicaItems than maxCopies (' + replicaOptions.maxCopies + ')', 'skeleWarning');
            return;
        }

        let sampleItem = formContext.replicas[replicaName][0];
        let newReplicaItem = {
            formContext: formContext,
            replicaOptions: replicaOptions,
            fieldSchema: data.fieldSchema,
            skeleformGroupLevel: sampleItem.skeleformGroupLevel,
            template: sampleItem.template
        }

        // save form status
        Skeleform.utils.autoSaveFormData(formContext, formContext.fields);

        formContext.replicaVars[replicaName].set(false);

        if (formContext.item) {
            formContext.item[replicaName].insertAt(newReplicaItem, insertionIndex);
        }

        formContext.replicas[replicaName].insertAt(newReplicaItem, insertionIndex);
        // add new element also on the already taken snapshot (the tracker will re-set the form values using it)
        formContext.autoSaves[formContext.autoSaves.length - 1][replicaName].insertAt(newReplicaItem, insertionIndex);
        formContext.replicaVars[replicaName].set(true);
        formContext.isRestoringData = true;
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

        if (formContext.replicas[replicaName].length <= replicaOptions.minCopies) {
            Materialize.toast(TAPi18n.__('minReplicaCopies_error', replicaOptions.maxCopies), 5000, 'error');
            SkeleUtils.GlobalUtilities.logger('Tried to remove more replicaItems than minCopies (' + replicaOptions.minCopies + ')', 'skeleWarning');
            return;
        }

        // save form status
        Skeleform.utils.autoSaveFormData(formContext, formContext.fields);

        formContext.replicaVars[replicaName].set(false);

        if (formContext.item) {
            formContext.item[replicaName].removeAt(deletionIndex);
        }

        formContext.replicas[replicaName].removeAt(deletionIndex);
        // add new element also on the already taken snapshot (the tracker will re-set the form values using it)
        formContext.autoSaves[formContext.autoSaves.length - 1][replicaName].removeAt(deletionIndex);
        formContext.replicaVars[replicaName].set(true);
        formContext.isRestoringData = true;
    }
});
