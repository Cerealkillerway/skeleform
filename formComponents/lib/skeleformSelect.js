// SELECT
// select box field

// Helpers
Template.skeleformSelect.helpers(skeleformGeneralHelpers);
Template.skeleformSelect.helpers({
    options: function(schema) {
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

                schema.sourceName.split('.').forEach(function(nameShard, index) {
                    switch (nameShard) {
                        case ':itemLang':
                        if (nameAttr[lang]) {
                            nameAttr = nameAttr[lang];
                        }
                        else {
                            nameAttr = nameAttr[defaultLang];
                            missingTranslation = true;
                        }
                        break;

                        default:
                        nameAttr = nameAttr[nameShard];
                    }
                });

                schema.sourceValue.split('.').forEach(function(valueShard, index) {
                    switch (valueShard) {
                        case ':itemLang':
                        if (valueAttr[lang]) {
                            valueAttr = valueAttr[lang];
                        }
                        else {
                            valueAttr = valueAttr[defaultLang];
                            missingTranslation = true;
                        }
                        break;

                        default:
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

        var pathShards = data.schema.name.split('.');
        var value = data.item;

        if (!data.item) {
            return "";
        }

        if (data.schema.i18n === undefined) {
            value = value[FlowRouter.getParam('itemLang')];
        }

        try {
            pathShards.forEach(function(shard, index) {
                value = value[shard];

                if (!value) throw 'nodataError';
            });
        }
        catch (error) {
            return;
        }

        if (option.toString() === value) {
            return 'selected';
        }
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
    var dataContext = self.data;

    //register self on form' store
    dataContext.formInstance.Fields.push(self);

    self.getValue = function() {
        return $('#' + dataContext.schema.name).val();
    };
    self.isValid = function() {
        console.log('select is valid');
        return true;
    };
});
Template.skeleformSelect.events({
    "blur select": function(event, template) {
        skeleformSuccessStatus('#' + template.data.schema.name);
    }
});

Template.skeleformSelect.onRendered(function() {
    var self = this;

    Tracker.autorun(function() {
        if (FlowRouter.subsReady()) {
            var data = self.data;

            self.$('select').material_select();
        }
    });
});
