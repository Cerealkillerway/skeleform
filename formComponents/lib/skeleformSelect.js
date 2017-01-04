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
            var result = [];

            if (schema.allowBlank) {
                result.push({
                    name: TAPi18n.__("none_lbl"),
                    value: 'undefined'
                });
            }

            schema.source.forEach(function(item, index) {
                var option;
                var lang = FlowRouter.getParam('itemLang');
                var defaultLang = Skeletor.configuration.lang.default;
                var sourceName = schema.sourceName;
                var sourceValue = schema.sourceValue;
                var nameAttr = item;
                var valueAttr = item;
                var missingTranslation = false;

                // get the displaying name for the option
                schema.sourceName.split('.').forEach(function(nameShard, index) {
                    if (nameShard.indexOf(':itemLang---') === 0) {
                        var nameOnly = nameShard.substring(12, nameShard.length);

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
                    option.name = nameAttr;
                }

                result.push(option);
            });

            return result;
        }
        return schema.source;
    },
    isSelected: function(data, option) {
        var schema = data.schema;
        var pathShards = schema.name.split('.');
        var value = data.item;
        var name;

        if (!data.item) {
            return "";
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
        var schema = Template.instance().data.schema;

        if (schema.multi) {
            return 'multiple';
        }
        return '';
    },
    icon: function(option) {
        if (option.icon) {
            return option.icon;
        }
        return "";
    }
});


// Events
Template.skeleformSelect.onCreated(function() {
    var self = this;
    self.isActivated = new ReactiveVar(false);

    //register self on form' store
    self.data.formInstance.Fields.push(self);

    self.i18n = function() {
        $getFieldId(self, self.data.schema).material_select();
    };
    self.getValue = function() {
        //skeleUtils.globalUtilities.logger('select validation', 'skeleformFieldValidation');
        return $getFieldId(self, self.data.schema).val();
    };
    self.isValid = function() {
        var formInstance = self.data.formInstance;

        return Skeleform.validate.checkOptions(self.getValue(), self.data.schema, formInstance.data.schema, formInstance.data.item);
    };
    self.setValue = function(value) {
        // in this field value is not setted by "setValue()" since it's determinated by "isSelected helper";
        // anyway the standard "fieldValue" helper is also included in the template since it handles i18n for the field;
    };
});
Template.skeleformSelect.onRendered(function() {
    var self = this;

    $getFieldId(self, self.data.schema).material_select();

    self.isActivated.set(true);
});
Template.skeleformSelect.events({
    'blur select': function(event, template) {
        skeleformSuccessStatus('#' + template.data.schema.name);
    },
    'change select': function(event, template) {
        // perform validation and callback invocation on change
        var value = template.getValue();
        var schema = template.data.schema;

        template.isValid();

        InvokeCallback(template, value, schema, 'onChange');
    }
});
