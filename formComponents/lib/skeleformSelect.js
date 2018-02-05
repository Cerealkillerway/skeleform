// SELECT
// select box field

// Helpers
Template.skeleformSelect.helpers(skeleformGeneralHelpers);
Template.skeleformSelect.helpers({
    // create sources list for selct's options
    options: function(schema) {
        const instance = Template.instance();

        // if source field is a query result, then build the option objects using
        // defined "sourceName" and "sourceValue" fields
        if (schema.sourceValue) {
            let result = [];

            if (schema.blankValue) {
                result.push({
                    name: TAPi18n.__('none_lbl'),
                    value: schema.blankValue
                });
            }
            let source;

            // check if source is a Mongo cursor, an array or a function;
            if (Match.test(schema.source, Mongo.Cursor) || Match.test(schema.source, [Match.Any])) {
                source = schema.source;
            }
            else {
                source = schema.source(instance);
            }

            // add blank option if needed
            if (schema.allowBlank) {
                result.push({
                    name: TAPi18n.__('none_lbl'),
                    value: '',
                    disabled: 'disabled',
                    selected: 'selected'
                });
            }

            source.forEach(function(item, index) {
                let option;
                let lang = FlowRouter.getParam('itemLang');
                let defaultLang = Skeletor.configuration.lang.default;
                let sourceName = schema.sourceName;
                let sourceValue = schema.sourceValue;
                let nameAttr = item;
                let valueAttr = item;
                let missingTranslation = false;

                // get the displaying name for the option
                schema.sourceName.split('.').forEach(function(nameShard, index) {
                    if (nameShard.indexOf(':itemLang---') === 0) {
                        let nameOnly = nameShard.substring(12, nameShard.length);

                        if (nameAttr[lang + '---' + nameOnly]) {
                            nameAttr = nameAttr[lang + '---' + nameOnly];
                        }
                        else {
                            nameAttr = nameAttr[defaultLang + '---' + nameOnly];
                            missingTranslation = true;
                        }
                    }
                    else {
                        nameAttr = nameAttr[nameShard];
                    }
                });

                // get the value for the option
                schema.sourceValue.split('.').forEach(function(valueShard, index) {
                    if (valueShard.indexOf(':itemLang---') === 0) {
                        let valueNameOnly = valueShard.substring(12, valueShard.length);

                        if (valueAttr[lang + '---' + valueNameOnly]) {
                            valueAttr = valueAttr[lang + '---' + valueNameOnly];
                        }
                        else {
                            valueAttr = valueAttr[defaultLang + '---' + valueNameOnly];
                            missingTranslation = true;
                        }
                    }
                    else {
                        valueAttr = valueAttr[valueShard];
                    }
                });

                option = {
                    value: valueAttr
                };

                if (missingTranslation) {
                    option.name = '#(' + nameAttr + ')';
                }
                else {
                    if (schema.sourceNameTransformation) {
                        option.name = schema.sourceNameTransformation.transform(nameAttr, item);
                    }
                    else {
                        option.name = nameAttr;
                    }
                }

                result.push(option);
            });

            return result;
        }

        return schema.source;
    },
    isMultiple: function() {
        const instance = Template.instance();
        let schema = instance.data.fieldSchema.get();

        if (schema.multi) {
            return 'multiple';
        }
        return '';
    },
    icon: function(option) {
        if (option.icon) {
            return option.icon;
        }
        return '';
    },
    iconClasses: function(option) {
        if (option.iconClasses) {
            return option.iconClasses.join(' ');
        }
        return '';
    }
});


// Events
Template.skeleformSelect.onCreated(function() {
    // register this on form' store
    Skeleform.utils.registerField(this);
    this.isActivated = new ReactiveVar(false);

    let schema = this.data.fieldSchema.get();

    Skeleform.utils.InvokeCallback(this, null, schema, 'onCreated');

    this.i18n = () => {
        Skeleform.utils.$getFieldById(this, schema).material_select();
    };
    this.getValue = () => {
        return Skeleform.utils.$getFieldById(this, schema).val();
    };
    this.isValid = () => {
        let formContext = this.data.formContext;

        return Skeleform.validate.checkOptions(this.getValue(), schema, formContext.schema, formContext.item);
    };
    this.setValue = (value) => {
        let name = schema.name;
        let $field = Skeleform.utils.$getFieldById(this, schema);

        if (value === undefined) {
            $field.children().prop('selected', false);
            $field.material_select();
        }

        for (const option of $field.children()) {
            let optionValue = $(option).val();

            // if the select is multi, the value is an array
            if (schema.multi) {
                if (value.indexOf(optionValue) >= 0) {
                    $(option).prop('selected', true);
                }
                else {
                    $(option).prop('selected', false);
                }
            }

            // otherwise the value is a string
            else {
                if (value === optionValue) {
                    $(option).prop('selected', true);
                    break;
                }
                else {
                    $(option).prop('selected', false);
                }
            }
        }

        $field.material_select();

        // here cannot test value !== this.getValue() since the actual value for the field in the current document
        // can be the first value (default preselected) for the field;
        Skeleform.utils.InvokeCallback(this, value, schema, 'onChange');

        return;
    };
});

Template.skeleformSelect.onRendered(function() {
    let schema = this.data.fieldSchema.get();

    // start plugin
    let $field = Skeleform.utils.$getFieldById(this, schema);
    let $options = $field.children('option');

    /*if (schema.allowBlank) {
        console.log('allowblank');
        $field.children().first().prop('selected, true');
        console.log($field.children().first());
    }*/

    $field.material_select();
    this.isActivated.set(true);

    Skeleform.utils.InvokeCallback(this, null, schema, 'onRendered');

    // DISABLED - was causing infinite loop
    // start plugin and fire onChange callback when DOM is changed
    /*let observer = new MutationObserver((mutations) => {
        let value = this.getValue();

        $field = Skeleform.utils.$getFieldById(this, schema);
        // DISABLED the following instruction was causing the infinite loop
        //$field.material_select();


        Skeleform.utils.InvokeCallback(this, value, schema, 'onChange');
    });
    observer.observe(Skeleform.utils.$getFieldById(this, schema)[0], {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
    });*/
});

Template.skeleformSelect.onDestroyed(function() {
    let fields = this.data.formContext.fields;

    fields.removeAt(fields.indexOf(this));
});

Template.skeleformSelect.events({
    'blur select': function(event, instance) {
        Skeleform.validate.skeleformSuccessStatus('#' + instance.data.schema.get().name);
    },
    'change select': function(event, instance) {
        // perform validation and callback invocation on change
        let value = instance.getValue();
        let schema = instance.data.fieldSchema.get();

        instance.isValid();

        Skeleform.utils.InvokeCallback(instance, value, schema, 'onChange');
    }
});
