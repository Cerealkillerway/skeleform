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
                        var valueNameOnly = valueShard.substring(12, valueShard.length);

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
        let schema = instance.data.schema;

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
    this.isActivated = new ReactiveVar(false);

    setReplicaIndex(this);
    InvokeCallback(this, null, this.data.schema, 'onCreated');

    // register this on form' store
    this.data.formInstance.Fields.push(this);

    this.i18n = () => {
        $getFieldById(this, this.data.schema).material_select();
    };
    this.getValue = () => {
        //SkeleUtils.GlobalUtilities.logger('select validation', 'skeleformFieldValidation');
        return $getFieldById(this, this.data.schema).val();
    };
    this.isValid = () => {
        var formInstance = this.data.formInstance;

        return Skeleform.validate.checkOptions(this.getValue(), this.data.schema, formInstance.data.schema, formInstance.data.item);
    };
    this.setValue = (value) => {
        if (!value) {
            return '';
        }

        const instance = Template.instance();
        let schema = this.data.schema;
        let name = schema.name;
        let $field = $getFieldById(instance, instance.data.schema);

        InvokeCallback(this, value, schema, 'onChange');

        for (const option of $field.children()) {
            let optionValue = $(option).val();

            // if the select is multi, the value is an array
            if (schema.multi) {
                if (value.indexOf(optionValue) >= 0) {
                    $(option).prop('selected', true);
                    $field.material_select();
                }
            }

            // otherwise the value is a string
            else {
                if (value === optionValue) {
                    $(option).prop('selected', true);
                    $field.material_select();
                    break;
                }
            }
        }

        return '';
    };
});

Template.skeleformSelect.onRendered(function() {
    let schema = this.data.schema;

    // start plugin
    let $field = $getFieldById(this, schema);
    let $options = $field.children('option');

    $field.material_select();
    this.isActivated.set(true);

    InvokeCallback(this, this.getValue(), schema, 'onChange');

    // DISABLED - was causing infinite loop
    // start plugin and fire onChange callback when DOM is changed
    /*let observer = new MutationObserver((mutations) => {
        let value = this.getValue();

        $field = $getFieldById(this, schema);
        // DISABLED the following instruction was causing the infinite loop
        //$field.material_select();


        InvokeCallback(this, value, schema, 'onChange');
    });
    observer.observe($getFieldById(this, schema)[0], {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
    });*/
});

Template.skeleformSelect.onDestroyed(function() {
    let Fields = this.data.formInstance.Fields;

    Fields.removeAt(Fields.indexOf(this));
});

Template.skeleformSelect.events({
    'blur select': function(event, instance) {
        skeleformSuccessStatus('#' + instance.data.schema.name);
    },
    'change select': function(event, instance) {
        // perform validation and callback invocation on change
        let value = instance.getValue();
        let schema = instance.data.schema;

        instance.isValid();

        InvokeCallback(instance, value, schema, 'onChange');
    }
});
