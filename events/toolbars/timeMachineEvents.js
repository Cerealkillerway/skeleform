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
        let index = $(event.target).data('index');
        let formContext = instance.data.formContext;
        let edits = formContext.item.__edits;
        let selectedEdit = edits[index];

        function restoreEdit(editToRestore) {
            _.each(editToRestore, function(fieldValue, key) {
                if (key.indexOf('__') !== 0) {

                    let fieldName = SkeleUtils.ClientServerUtilities.getFieldName(key).name;
                    let fieldInstance = SkeleUtils.GlobalUtilities.getFieldInstance(formContext, fieldName);

                    fieldInstance.setValue(fieldValue);
                }
            });
        }

        for (let i = edits.length - 1; i >= index; i--) {
            console.log(`restoring edit ${i}`);
            restoreEdit(edits[i]);
        }

        instance.$('.timeMachineFunctionsWrapper').toggleClass('active');
        instance.$('.timeMachineFunctionsOverlay').toggleClass('active');
    }
})
