// INPUT
// The standard input field
// it integrates autonumeric.js plugin to manage "formatAs" options
// see http://www.decorplanit.com/plugin/ for more details

// Helpers
Template.skeleformCheckBox.helpers(skeleformGeneralHelpers);
Template.skeleformCheckBox.helpers({
    fieldValue: function(data, schema) {
        const instance = Template.instance();

        setFieldValue(instance, data, schema);
    },
    isCheckBox: function() {
        const instance = Template.instance();
        let schema = instance.data.schema;

        if (!schema.renderAs || schema.renderAs === 'checkbox') {
            return true;
        }
        return false;
    },
    switchLabel: function(type) {
        const instance = Template.instance();
        let schema = instance.data.schema;

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
    this.isActivated = new ReactiveVar(false);

    // register this on form' store
    this.data.formInstance.Fields.push(this);

    this.getValue = () => {
        let value = $getFieldId(this, this.data.schema).prop('checked');

        return value;
    };
    this.isValid = () => {
        //skeleUtils.globalUtilities.logger('checkbox validation', 'skeleformFieldValidation');
        let validationOptions = this.data.schema.validation;
        let result = {
            valid: true,
            reasons: [],
            invalidMessages: {
                min: 'required'
            }
        };

        if (validationOptions && validationOptions.min === 1) {
            if (!this.getValue()) {
                result.valid = false;
                result.reasons.push('min');
            }
        }

        return result;
    };
    this.setValue = (value) => {
        $getFieldId(this, this.data.schema).prop('checked', value);
    };
});

Template.skeleformCheckBox.onRendered(function() {
    this.isActivated.set(true);
});


Template.skeleformCheckBox.events({
    'change .skeleValidate': function(event, template) {
        // perform validation and callback invocation on change
        let value = template.getValue();
        let schema = template.data.schema;

        template.isValid();

        InvokeCallback(template, value, schema, 'onChange');
    },
});
