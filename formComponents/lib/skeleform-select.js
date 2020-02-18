import { FlowRouter } from 'meteor/ostrio:flow-router-extra'


// SELECT
// select box field

// Helpers
Template.skeleformSelect.helpers(skeleformGeneralHelpers)
Template.skeleformSelect.helpers({
    // create sources list for selct's options
    options: function(schema) {
        const instance = Template.instance()
        let newSource = instance.updateSource.get()

        if (!instance.data.formContext.skeleSubsReady.get()) {
            return false
        }
        if (!instance.subscriptionsReady.get()) {
            return false
        }

        // if source field is a query result, then build the option objects using
        // defined "sourceName" and "sourceValue" fields

        if (schema.sourceValue) {
            let result = []

            if (schema.blankValue) {
                result.push({
                    name: Skeletor.Skelelang.i18n.get('none_lbl'),
                    value: schema.blankValue
                })
            }
            let source

            if (newSource) {
                source = newSource
            }
            else {
                // check if source is a Mongo cursor, an array or a function
                if (Match.test(schema.source, Mongo.Cursor) || Match.test(schema.source, [Match.Any])) {
                    source = schema.source
                }
                else {
                    source = schema.source(instance)
                }
            }

            // add blank option if needed
            if (schema.allowBlank) {
                let blankValue = ''

                if (schema.blankValue !== undefined) {
                    blankValue = schema.blankValue
                }

                result.push({
                    name: Skeletor.Skelelang.i18n.get('none_lbl'),
                    value: blankValue,
                    //disabled: 'disabled',
                    selected: 'selected'
                })
            }

            source.forEach(function(item, index) {
                let option
                let lang = FlowRouter.getParam('itemLang')
                let defaultLang = Skeletor.configuration.lang.default
                let sourceName = schema.sourceName
                let sourceValue = schema.sourceValue
                let nameToDisplay = []
                let valueAttr = item
                let missingTranslation = false


                if (!Array.isArray(schema.sourceName)) {
                    sourceName = [sourceName]
                }

                // get the displaying name for the option
                for (name of sourceName) {
                    let nameAttr = item

                    name.split('.').forEach(function(nameShard, index) {
                        if (nameShard.indexOf(':itemLang---') === 0) {
                            let nameOnly = nameShard.substring(12, nameShard.length)

                            if (nameAttr[lang + '---' + nameOnly]) {
                                nameAttr = nameAttr[lang + '---' + nameOnly]
                            }
                            else {
                                nameAttr = nameAttr[defaultLang + '---' + nameOnly]
                                missingTranslation = true
                            }
                        }
                        else {
                            nameAttr = nameAttr[nameShard]
                        }
                    })

                    nameToDisplay.push(nameAttr)
                }

                // get the value for the option
                schema.sourceValue.split('.').forEach(function(valueShard, index) {
                    if (valueShard.indexOf(':itemLang---') === 0) {
                        let valueNameOnly = valueShard.substring(12, valueShard.length)

                        if (valueAttr[lang + '---' + valueNameOnly]) {
                            valueAttr = valueAttr[lang + '---' + valueNameOnly]
                        }
                        else {
                            valueAttr = valueAttr[defaultLang + '---' + valueNameOnly]
                            missingTranslation = true
                        }
                    }
                    else {
                        valueAttr = valueAttr[valueShard]
                    }
                })

                option = {
                    value: valueAttr
                }

                nameToDisplay = nameToDisplay.join(' ')

                if (missingTranslation) {
                    option.name = '#(' + nameToDisplay + ')'
                }
                else {
                    if (schema.sourceNameTransformation) {
                        option.name = schema.sourceNameTransformation.transform(nameToDisplay, item)
                    }
                    else {
                        option.name = nameToDisplay
                    }
                }

                result.push(option)
            })

            return result
        }

        for (source of schema.source) {
            let currentLang = Skeletor.Skelelang.i18n.currentLocale.get()

            source.name = Skeletor.Skelelang.i18n.get(currentLang, source.label)
        }

        return schema.source
    },
    isMultiple: function() {
        const instance = Template.instance()
        let schema = instance.data.fieldSchema.get()

        if (schema.multi) {
            return 'multiple'
        }
        return ''
    },
    image: function(option) {
        if (option.image) {
            return option.image
        }
        return ''
    },
    imageClasses: function(option) {
        if (option.imageClasses) {
            return option.imageClasses.join(' ')
        }
        return ''
    }
})


// Events
Template.skeleformSelect.onCreated(function() {
    // register this on form' store
    Skeleform.utils.registerField(this)
    this.isActivated = new ReactiveVar(false)
    this.updateSource = new ReactiveVar(false)
    this.subscriptionsReady = new ReactiveVar(false)
    this.sourceSet = new ReactiveVar(false)

    let fieldSchema = this.data.fieldSchema.get()

    Skeleform.utils.InvokeCallback(this, null, fieldSchema, 'onCreated')

    this.setSource = (newSource) => {
        Skeletor.Skeletor.SkeleUtils.GlobalUtilities.logger('new source injected', 'skeleformField')
        this.updateSource.set(newSource)

        let $field = Skeleform.utils.$getFieldById(this, fieldSchema)

        Tracker.afterFlush(function() {
            M.FormSelect.init($field[0])
        })
    }
    this.i18n = () => {
        M.FormSelect.init(Skeleform.utils.$getFieldById(this, fieldSchema)[0])
    }
    this.getValue = () => {
        return Skeleform.utils.$getFieldById(this, fieldSchema).val()
    }
    this.isValid = () => {
        let formContext = this.data.formContext

        return Skeleform.validate.checkOptions(this.getValue(), fieldSchema, formContext.schema, formContext.item)
    }
    this.setValue = (value) => {
        Tracker.afterFlush(() => {
            let $field = Skeleform.utils.$getFieldById(this, fieldSchema)

            if (!this.subscriptionsReady.get()) {
                return false
            }

            if (value === undefined) {
                $field.children().prop('selected', false)
                $field.children().first().prop('selected', true)
                M.FormSelect.init($field[0])
            }

            for (const option of $field.children()) {
                let optionValue = $(option).val()

                // if the select is multi, the value is an array
                if (fieldSchema.multi) {
                    if (value && value.indexOf(optionValue) >= 0) {
                        $(option).attr('selected', true)
                    }
                    else {
                        $(option).attr('selected', false)
                    }
                }

                // otherwise the value is a string
                else {
                    if (value === optionValue) {
                        $(option).attr('selected', true)

                    }
                    else {
                        $(option).attr('selected', false)
                    }
                }
            }

            M.FormSelect.init($field[0])
        })

        // here cannot test value !== this.getValue() since the actual value for the field in the current document
        // can be the first value (default preselected) for the field
        Skeleform.utils.InvokeCallback(this, value, fieldSchema, 'onChange')

        return
    }
})

Template.skeleformSelect.onRendered(function() {
    let fieldSchema = this.data.fieldSchema.get()

    // start plugin
    let $field = Skeleform.utils.$getFieldById(this, fieldSchema)

    this.autorun(() => {
        if (fieldSchema.subscription) {
            this.subscriptionsReady.set(fieldSchema.subscription(this))

            let $field = Skeleform.utils.$getFieldById(this, fieldSchema)

            Tracker.afterFlush(function() {
                M.FormSelect.init($field[0])
            })
        }
        else {
            this.subscriptionsReady.set(true)
        }
    })

    this.autorun(() => {
        if (!this.data.formContext.skeleSubsReady.get()) {
            return false
        }
        if (!this.subscriptionsReady.get()) {
            return false
        }

        M.FormSelect.init($field[0])
        this.isActivated.set(true)
    })

    Skeleform.utils.InvokeCallback(this, null, fieldSchema, 'onRendered')
})

Template.skeleformSelect.onDestroyed(function() {
    let fields = this.data.formContext.fields

    fields.removeAt(fields.indexOf(this))
})

Template.skeleformSelect.events({
    'blur select': function(event, instance) {
        Skeleform.validate.skeleformSuccessStatus('#' + instance.data.schema.get().name)
    },
    'change select': function(event, instance) {
        // perform validation and callback invocation on change
        let value = instance.getValue()
        let fieldSchema = instance.data.fieldSchema.get()

        instance.isValid()

        Skeleform.utils.InvokeCallback(instance, value, fieldSchema, 'onChange', true)
    }
})
