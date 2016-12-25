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
    },
    isCheckBox: function() {
        var schema = Template.instance().data.schema;

        if (!schema.renderAs || schema.renderAs === 'checkbox') {
            return true;
        }
        return false;
    },
    switchLabel: function(type) {
        var schema = Template.instance().data.schema;

        if (type === 'off') {
            if (schema.labels && schema.labels.off) {
                return TAPi18n.__(schema.labels.off + '_lbl');
            }
            return TAPi18n.__('no_lbl');
        }
        else {
            if (schema.labels && schema.labels.on) {
                return TAPi18n.__(schema.labels.on + '_lbl');
            }
            return TAPi18n.__('yes_lbl');
        }
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
        var validationOptions = self.data.schema.validation;
        var result = {
            valid: true,
            reasons: [],
            invalidMessages: {
                min: 'required'
            }
        };

        if (validationOptions && validationOptions.min === 1) {
            if (!self.getValue()) {
                result.valid = false;
                result.reasons.push('min');
            }
        }

        return result;
    };
});

Template.skeleformCheckBox.events({
    "change .skeleValidate": function(event, template) {
        var value = $(event.target).prop('checked');
        var schema = template.data.schema;

        skeleformValidateField(template);

        // if defined, perform the callback
        if (schema.callbacks && schema.callbacks.onChange) {
            schema.callbacks.onChange(value);
        }
    },
});
