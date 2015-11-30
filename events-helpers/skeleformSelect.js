// SELECT
// select box field

Template.skeleformSelect.helpers(skeleformGeneralHelpers);
Template.skeleformSelect.helpers({
    options: function(schema) {
        if (schema.sourceValue) {
            var result = [];

            schema.source.forEach(function(item, index) {
                var option = {
                    name: item[schema.sourceName],
                    value: item[schema.sourceValue]
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

        pathShards.forEach(function(shard, index) {
            value = value[shard];
        });

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
