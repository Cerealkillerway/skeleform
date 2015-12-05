// SELECT
// select box field

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
                var sourceName = schema.sourceName;
                var sourceValue = schema.sourceValue;
                var nameAttr = item;
                var valueAttr = item;

                try {
                    schema.sourceName.split('.').forEach(function(nameShard, index) {
                        switch (nameShard) {
                            case ':itemLang':
                            nameAttr = nameAttr[lang];
                            break;

                            default:
                            nameAttr = nameAttr[nameShard];
                        }
                        if (nameAttr === undefined) throw 'nodataError';
                    });

                    schema.sourceValue.split('.').forEach(function(valueShard, index) {
                        switch (valueShard) {
                            case ':itemLang':
                            valueAttr = valueAttr[lang];
                            break;

                            default:
                            valueAttr = valueAttr[valueShard];
                        }
                        if (!valueAttr) throw 'nodataError';
                    });
                }
                catch (error) {
                    return;
                }

                option = {
                    name: nameAttr,
                    value: valueAttr
                };

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
