// SELECT
// select box field

Template.skeleformSelect.helpers(skeleformGeneralHelpers);
Template.skeleformSelect.helpers({
    isSelected: function(data, option) {

        var pathShards = data.schema.name.split('.');
        var value = data.item;

        if (!data.item) {
            return "";
        }

        pathShards.forEach(function(shard, index) {
            value = value[shard];
        });

        if (option === value) {
            return 'selected';
        }
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
            self.$('select').material_select();
        }
    });
});
