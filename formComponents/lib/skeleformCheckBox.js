// INPUT
// The standard input field
// it integrates autonumeric.js plugin to manage "formatAs" options
// see http://www.decorplanit.com/plugin/ for more details

// Helpers
Template.skeleformCheckBox.helpers(skeleformGeneralHelpers);
Template.skeleformCheckBox.helpers({
    fieldValue: function(data, schema) {
        var value = SkeleformStandardFieldValue(data, schema);

        if (value) {
            return 'checked';
        }
        return 'unchecked';
    }
});


// Events
Template.skeleformCheckBox.onCreated(function() {
    var self = this;
    var dataContext = self.data;

    // register self on form' store
    dataContext.formInstance.Fields.push(self);

    self.getValue = function() {
        var value = $('#' + dataContext.schema.name.replace('.', '\\.')).prop('checked');

        return value;
    };
    self.isValid = function() {
        var formInstance = self.data.formInstance;

        return Skeleform.validate.checkOptions(self.getValue(), self.data.schema, formInstance.data.schema, formInstance.data.item);
    };
});

Template.skeleformCheckBox.events({
    "change .skeleValidate": function(event, template) {
        var value = $(event.target).val();
        var schema = template.data.schema;

        //skeleformValidateField(template);
    },
});
