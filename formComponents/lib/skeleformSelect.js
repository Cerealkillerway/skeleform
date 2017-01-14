// SELECT
// select box field

// Helpers
Template.skeleformSelect.helpers(skeleformGeneralHelpers);
Template.skeleformSelect.helpers({
    // create sources list for selct's options
    options: function(schema) {
        // if source field is a query result, then build the option objects using
        // defined "sourceName" and "sourceValue" fields
        if (schema.sourceValue) {
            let result = [];

            if (schema.allowBlank) {
                result.push({
                    name: TAPi18n.__("none_lbl"),
                    value: 'undefined'
                });
            }
            let source;

            // check if source is a Mongo cursor, an arary or a function;
            if (Match.test(schema.source, Mongo.Cursor) || Match.test(schema.source, [Match.Any])) {
                source = schema.source;
            }
            else {
                source = schema.source();
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
                        option.name = schema.sourceNameTransformation(nameAttr, item);
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
    isSelected: function(data, option) {
        let schema = data.schema;
        let pathShards = schema.name.split('.');
        let value = data.item;
        let name;

        if (!data.item) {
            return '';
        }

        if (data.schema.i18n === undefined) {
            name = FlowRouter.getParam('itemLang') + '---' + data.schema.name;
            value = value[name];
        }
        else {
            pathShards.forEach(function(shard, index) {
                value = value[shard];
            });
        }

        if (!value) return;

        // if the select is multi, the value is an array
        if (schema.multi) {
            if (value.indexOf(option.toString()) >= 0) {
                return 'selected';
            }
        }
        // otherwise the value is a string
        else {
            if (option.toString() === value) {
                return 'selected';
            }
        }

        return '';
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
    }
});


// Events
Template.skeleformSelect.onCreated(function() {
    this.isActivated = new ReactiveVar(false);

    //register this on form' store
    this.data.formInstance.Fields.push(this);

    this.i18n = () => {
        $getFieldId(this, this.data.schema).material_select();
    };
    this.getValue = () => {
        //skeleUtils.globalUtilities.logger('select validation', 'skeleformFieldValidation');
        return $getFieldId(this, this.data.schema).val();
    };
    this.isValid = () => {
        var formInstance = this.data.formInstance;

        return Skeleform.validate.checkOptions(this.getValue(), this.data.schema, formInstance.data.schema, formInstance.data.item);
    };
    this.setValue = (value) => {
        // in this field value is not setted by "setValue()" since it's determinated by "isSelected helper";
        // anyway the standard "fieldValue" helper is also included in the template since it handles i18n for the field;
    };
});
Template.skeleformSelect.onRendered(function() {
    $getFieldId(this, this.data.schema).material_select();
    this.isActivated.set(true);
});
Template.skeleformSelect.events({
    'blur select': function(event, template) {
        skeleformSuccessStatus('#' + template.data.schema.name);
    },
    'change select': function(event, template) {
        // perform validation and callback invocation on change
        let value = template.getValue();
        let schema = template.data.schema;

        template.isValid();

        InvokeCallback(template, value, schema, 'onChange');
    }
});
