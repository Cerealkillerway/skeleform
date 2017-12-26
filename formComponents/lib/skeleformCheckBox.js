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
    let schema = this.data.schema;
    this.isActivated = new ReactiveVar(false);

    setReplicaIndex(this);
    InvokeCallback(this, null, this.data.schema, 'onCreated');

    // register this on form' store
    this.data.formInstance.Fields.push(this);

    this.getValue = () => {
        let value = $getFieldById(this, schema).prop('checked');

        return value;
    };
    this.isValid = () => {
        //SkeleUtils.GlobalUtilities.logger('checkbox validation', 'skeleformFieldValidation');
        let validationOptions = schema.validation;
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
        // if setting a real value, fire onChange callback
        if (value !== undefined) {
            InvokeCallback(this, value, schema, 'onChange');
        }

        $getFieldById(this, schema).prop('checked', value);
    };
});
Template.skeleformCheckBox.onDestroyed(function() {
    let Fields = this.data.formInstance.Fields;

    Fields.removeAt(Fields.indexOf(this));
});

Template.skeleformCheckBox.onRendered(function() {
    this.isActivated.set(true);
});


Template.skeleformCheckBox.events({
    'change .skeleValidate': function(event, instance) {
        // perform validation and callback invocation on change
        let value = instance.getValue();
        let schema = instance.data.schema;

        instance.isValid();

        InvokeCallback(instance, value, schema, 'onChange');
    },
});
