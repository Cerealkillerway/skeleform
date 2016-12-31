// INPUT
// The standard input field
// it integrates autonumeric.js plugin to manage "formatAs" options
// see http://www.decorplanit.com/plugin/ for more details

// Helpers
Template.skeleformCheckBox.helpers(skeleformGeneralHelpers);
Template.skeleformCheckBox.helpers({
    fieldValue: function(data, schema) {
        var template = Template.instance();

        setFieldValue(template, data, schema);
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
    self.isActivated = new ReactiveVar(false);

    // register self on form' store
    self.data.formInstance.Fields.push(self);

    self.getValue = function() {
        var value = $getFieldId(self, self.data.schema).prop('checked');

        return value;
    };
    self.isValid = function() {
        skeleUtils.globalUtilities.logger('checkbox validation', 'skeleformFieldValidation');
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
    self.setValue = function(value) {
        $getFieldId(self, self.data.schema).prop('checked', value);
    };
});

Template.skeleformCheckBox.onRendered(function() {
    this.isActivated.set(true);
});


Template.skeleformCheckBox.events({
    'change .skeleValidate': function(event, template) {
        // perform validation and callback invocation on change
        var value = template.getValue();
        var schema = template.data.schema;

        template.isValid();

        InvokeCallback(template, value, schema, 'onChange');
    },
});
