Template.timeMachineFunctions.onCreated(function() {
    let formContext = this.data.formContext

    if (!formContext.item) {
        return false
    }

    let documentId = formContext.item._id
    let schema = formContext.schema
    let collection = schema.__collection
    let subManager = Skeletor.subsManagers[schema.__subManager]
    let query = {
        _id: documentId
    }
    let options = {
        fields: {
            __edits: 1
        }
    }
    this.statesReady = new ReactiveVar(false)
    this.currentState = new ReactiveVar(0)

    if (documentId) {
        if (subManager) {
            handle = subManager.subscribe('findDocuments', collection, query, options)

            this.autorun(() => {
                if (handle.ready()) {
                    this.statesReady.set(true)
                }
            })
        }
        else {
            Meteor.subscribe('findDocuments', collection, query, options)
            this.autorun(() => {
                if (this.subscriptionsReady()) {
                    this.statesReady.set(true)
                }
            })
        }
    }
})


let deleteStateBtn = `
    <div class="deleteStateBtn">
        <i class="material-icons">delete</i>
    </div>
    `


Template.timeMachineFunctions.onRendered(function() {
    let formContext = this.data.formContext
    let instance = this

    this.autorun(() => {
        if (!this.statesReady.get()) {
            return false
        }

        let $availableStates = this.$('.availableStates')
        let schema = formContext.schema
        let documentId = formContext.item._id
        let collection = schema.__collection
        let item = Skeletor.Data[collection].findOne({_id: documentId})

        $availableStates.empty()
        if (!item.__edits) {
            return false
        }

        this.currentState.set(item.__edits.length)

        for (let [index, state] of item.__edits.entries()) {
            let stateDate = moment(state.__update.date, 'YYYYMMDD-HH:mm:ss').format('DD MMMM YYYY - HH:mm:ss')
            let $state = $(`
                <div class="availableState" data-index="${index}" data-time="${state.__update.date}">
                    <div class="stateIndex">(${index})</div>
                    <div class="stateDescription">${stateDate}</div>
                </div>
            `)

            if (index === 0) {
                $state.append(deleteStateBtn)
            }

            $availableStates.append($state)
        }
    })

    this.confirmModal = this.$('#timeMachineConfirmModal').modal()
    this.actions = {
        deleteAllStates: () => {
            Skeletor.SkeleUtils.GlobalUtilities.logger('deleting all timeMachine states for this document...', 'skeleformCommon')
            Meteor.call('skeleTimeMachineReset', formContext.item._id, formContext.schemaName, 'all', function(error, result) {
                if (error) {
                    Materialize.toast(Skeletor.Skelelang.i18n.get('serverError_error'), 5000, 'error')
                }
                instance.confirmModal.modal('close')
            })
        },

        deleteState: (params) => {
            let stateTime = params.stateTime

            Skeletor.SkeleUtils.GlobalUtilities.logger(`deleting state: ${stateTime}`, 'skeleformCommon')
            Meteor.call('skeleTimeMachineReset', formContext.item._id, formContext.schemaName, stateTime, function(error, result) {
                if (error) {
                    Materialize.toast(Skeletor.Skelelang.i18n.get('serverError_error'), 5000, 'error')
                }
                instance.confirmModal.modal('close')
            })
        }
    }
})


// function to restore a specific state
function restoreEdit(editToRestore, formContext) {
    function restoreField(key, fieldValue, replicaIndex) {
        let fieldName = Skeletor.SkeleUtils.ClientServerUtilities.getFieldName(key).name
        let fieldInstance = Skeletor.SkeleUtils.GlobalUtilities.getFieldInstance(formContext, fieldName, replicaIndex)

        if (fieldInstance) {
            fieldInstance.setValue(fieldValue)
        }
    }

    function restoreObject(itemValue, replicaIndex) {
        _.each(itemValue, function(value, key) {
            restoreField(key, value, replicaIndex)
        })
    }

    _.each(editToRestore, function(fieldValue, key) {
        if (key.indexOf('__') !== 0) {
            if (Array.isArray(fieldValue)) {
                for (const [index, element] of fieldValue.entries()) {
                    if (typeof element === 'object') {
                        restoreObject(element, index)
                    }
                    else {
                        restoreObject(element)
                    }
                }
            }
            else if (typeof fieldValue === 'object') {
                restoreObject(key, fieldValue)
            }
            else {
                restoreField(key, fieldValue)
            }
        }
    })
}


Template.timeMachineFunctions.events({
    'click .skeleformTimeMachineBtn'(_event, instance) {
        instance.find('.timeMachineFunctionsWrapper').classList.toggle('active')
        instance.find('.timeMachineFunctionsOverlay').classList.toggle('active')
    },

    'click .timeMachineFunctionsOverlay'(_event, instance) {
        instance.find('.timeMachineFunctionsWrapper').classList.toggle('active')
        instance.find('.timeMachineFunctionsOverlay').classList.toggle('active')
    },

    'click .availableState'(event, instance) {
        let indexToRestore = $(event.currentTarget).data('index')

        if (indexToRestore === undefined) {
            return false
        }

        const formContext = instance.data.formContext
        const edits = formContext.item.__edits
        let currentIndex = instance.currentState.get()

        // no need to do anything
        if (indexToRestore === currentIndex) {
            return false
        }

        Skeletor.SkeleUtils.GlobalUtilities.logger(`starting to restore state ${indexToRestore}`, 'SkeleUtils')

        if (indexToRestore > currentIndex) {
            // first restore to latest state, then go back to wanted state
            restoreEdit(formContext.item, formContext)
            Skeletor.SkeleUtils.GlobalUtilities.logger('Restored to latest...', 'SkeleUtils')
            currentIndex = edits.length
            instance.currentState.set(currentIndex)
        }

        // go back through states until wanted state
        for (i = currentIndex - 1; i >= indexToRestore; i--) {
            Skeletor.SkeleUtils.GlobalUtilities.logger(`restoring edit ${i}`, 'skeleform')
            restoreEdit(edits[i], formContext)
            instance.currentState.set(i)
        }

        // close time machine menu
        //instance.$('.timeMachineFunctionsWrapper').toggleClass('active')
        //instance.$('.timeMachineFunctionsOverlay').toggleClass('active')
    },

    'click .resetTimeMachineStatus'(_event, instance) {
        let formContext = instance.data.formContext
        let latestIndex = formContext.item.__edits.length

        if (instance.currentState.get() === latestIndex) {
            return false
        }

        Skeletor.SkeleUtils.GlobalUtilities.logger('Restoring latest...', 'SkeleUtils')
        restoreEdit(formContext.item, formContext)
        Skeleform.utils.restoreSavedData(formContext)
        instance.currentState.set(latestIndex)
    },

    'click .deleteTimeMachineStates'(_event, instance) {
        instance.$('#timeMachineConfirmModal').find('.confirmModalConfirm').data('action', 'deleteAllStates')
        instance.confirmModal.modal('open')
    },

    'click .deleteStateBtn'(event, instance) {
        let $modal = instance.$('#timeMachineConfirmModal').find('.confirmModalConfirm')
        let stateTime = $(event.currentTarget).parent('.availableState').data('time')

        $modal.data('action', 'deleteState')
        $modal.data('actionParams', JSON.stringify({'stateTime': stateTime}))
        instance.confirmModal.modal('open')
    },

    'click .confirmModalConfirm'(event, instance) {
        let $target = $(event.currentTarget)
        let action = $target.data('action')
        let params = $target.data('actionParams')

        if (params) {
            params = JSON.parse(params)
        }

        instance.actions[action](params)
    },

    'click .confirmModalUndo'(_event, instance) {
        instance.confirmModal.modal('close')
    },

    'mouseenter .squareBtn'(event, instance) {
        let tooltip = $(event.target).data('tooltip')

        instance.$('.toolbarDescription').html(Skeletor.Skelelang.i18n.get(tooltip))
    },

    'mouseleave .squareBtn'(_event, instance) {
        instance.$('.toolbarDescription').html('')
    }
})
