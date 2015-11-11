// SELECT
// select box field

Template.skeleformSelect.helpers(skeleformGeneralHelpers);
Template.skeleformSelect.helpers({
    fieldSelect: function(data, attribute) {
        if (!data || !data.fetch()[0]) return;
        if (Session.get('formRendered')) {
            $('#' + attribute).val(data.fetch()[0][attribute]);
            $('#' + attribute).material_select();
        }
    }
});

Template.skeleformSelect.events({
    "blur select": function(event, template) {
        skeleformSuccessStatus('#' + template.data.schema.name);
    }
});

Template.skeleformSelect.rendered = function() {
    this.$('select').material_select();
};
