// SELECT
// select box field

Template.skeleformSelect.helpers(skeleformGeneralHelpers);
Template.skeleformSelect.helpers({
    fieldSelect: function(data, attribute) {
        var id = '#' + attribute.replace('.', '\\.');
        if (!data || !data.fetch()[0]) return;
        if (Session.get('formRendered')) {

            var pathShards = attribute.split('.');
            var value = data.fetch()[0];

            pathShards.forEach(function(shard, index) {
                value = value[shard];
            });

            $(id).val(value);
            $(id).material_select();
        }
    }
});

Template.skeleformSelect.events({
    "blur select": function(event, template) {
        skeleformSuccessStatus('#' + template.data.schema.name);
    }
});

Template.skeleformSelect.rendered = function() {
    Tracker.autorun(function() {
        if (FlowRouter.subsReady()) {
            this.$('select').material_select();
        }
    });
};
