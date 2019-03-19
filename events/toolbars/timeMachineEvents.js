Template.timeMachineFunctions.onCreated(function() {
    let formContext = this.data.formContext;
    let documentId = formContext.item._id;
    let schema = formContext.schema;
    let collection = schema.__collection;
    let subManager = Skeletor.subsManagers[schema.__subManager];
    let query = {
        _id: documentId
    }
    let options = {
        fields: {
            __edits: 1
        }
    }
    this.statesReady = new ReactiveVar(false);
    this.currentState = new ReactiveVar(0);

    if (documentId) {
        if (subManager) {
            handle = subManager.subscribe('findDocuments', collection, query, options);

            this.autorun(() => {
                if (handle.ready()) {
                    this.statesReady.set(true);
                }
            });
        }
        else {
            Meteor.subscribe('findDocuments', collection, query, options);
            this.autorun(() => {
                if (this.subscriptionsReady()) {
                    this.statesReady.set(true);
                }
            });
        }
    }
});


Template.timeMachineFunctions.onRendered(function() {
    this.autorun(() => {
        if (!this.statesReady.get()) {
            return false;
        }

        let $availableStates = this.$('.availableStates');
        let formContext = this.data.formContext;
        let schema = formContext.schema;
        let documentId = formContext.item._id;
        let collection = schema.__collection;
        let item = Skeletor.Data[collection].findOne({_id: documentId});

        this.currentState.set(item.__edits.length);

        $availableStates.empty();
        for (let [index, state] of item.__edits.entries()) {
            let stateDate = moment(state.__update.date, 'YYYYMMDD-hh:mm:ss').format('DD MMMM YYYY - hh:mm:ss');

            $availableStates.append(`
                <div class="availableState" data-index="${index}">
                    ${stateDate} <span class="stateIndex">(${index})</span>
                </div>
            `);
        }
    });
});


// function to restore a specific state
function restoreEdit(editToRestore, formContext) {
    _.each(editToRestore, function(fieldValue, key) {
        if (key.indexOf('__') !== 0) {
            let fieldName = SkeleUtils.ClientServerUtilities.getFieldName(key).name;
            let fieldInstance = SkeleUtils.GlobalUtilities.getFieldInstance(formContext, fieldName);

            if (fieldInstance) {
                fieldInstance.setValue(fieldValue);
            }
        }
    });
}


Template.timeMachineFunctions.events({
    'click .skeleformTimeMachineBtn': function(event, instance) {
        instance.$('.timeMachineFunctionsWrapper').toggleClass('active');
        instance.$('.timeMachineFunctionsOverlay').toggleClass('active');
    },

    'click .timeMachineFunctionsOverlay': function(event, instance) {
        instance.$('.timeMachineFunctionsWrapper').toggleClass('active');
        instance.$('.timeMachineFunctionsOverlay').toggleClass('active');
    },

    'click .availableState': function(event, instance) {
        let indexToRestore = $(event.target).data('index');
        let formContext = instance.data.formContext;
        let edits = formContext.item.__edits;
        let selectedEdit = edits[indexToRestore];
        let currentIndex = instance.currentState.get();

        // no need to do anything
        if (indexToRestore === currentIndex) {
            return false;
        }

        SkeleUtils.GlobalUtilities.logger(`starting to restore state ${indexToRestore}`, 'SkeleUtils');

        if (indexToRestore > currentIndex) {
            // first restore to latest state, then go back to wanted state
            restoreEdit(formContext.item, formContext);
            SkeleUtils.GlobalUtilities.logger('Restored to latest...', 'SkeleUtils');
            currentIndex = edits.length;
            instance.currentState.set(currentIndex);
        }

        // go back through states until wanted state
        for (i = currentIndex - 1; i >= indexToRestore; i--) {
            SkeleUtils.GlobalUtilities.logger(`restoring edit ${i}`, 'skeleform');
            restoreEdit(edits[i], formContext);
            instance.currentState.set(i);
        }

        // close time machine menu
        //instance.$('.timeMachineFunctionsWrapper').toggleClass('active');
        //instance.$('.timeMachineFunctionsOverlay').toggleClass('active');
    },

    'click .resetTimeMachineStatus': function(event, instance) {
        let formContext = instance.data.formContext;
        let latestIndex = formContext.item.__edits.length;

        if (instance.currentState.get() === latestIndex) {
            return false;
        }

        SkeleUtils.GlobalUtilities.logger('Restoring latest...', 'SkeleUtils');
        restoreEdit(formContext.item, formContext);
        instance.currentState.set(latestIndex);
    },

    'mouseenter .squareBtn': function(event, instance) {
        let tooltip = $(event.currentTarget).data('tooltip');

        instance.$('.toolbarDescription').html(Skeletor.Skelelang.i18n.get('backToLatestStatus_tooltip'));
    },

    'mouseleave .squareBtn': function(event, instance) {
        instance.$('.toolbarDescription').html('');
    }
})
