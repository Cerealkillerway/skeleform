// INPUT
// The standard input field
// it integrates autonumeric.js plugin to manage "formatAs" options
// see http://www.decorplanit.com/plugin/ for more details

// Helpers
Template.skeleformCheckBox.helpers(skeleformGeneralHelpers);
Template.skeleformCheckBox.helpers({
    isCheckBox: function() {
        const instance = Template.instance();
        let schema = instance.data.fieldSchema.get();

        if (!schema.renderAs || schema.renderAs === 'checkbox') {
            return true;
        }
        return false;
    },
    switchLabel: function(type) {
        const instance = Template.instance();
        let schema = instance.data.fieldSchema.get();

        if (type === 'off') {
            if (schema.labels && schema.labels.off) {
                return Skeletor.Skelelang.i18n.get(schema.labels.off + '_lbl');
            }
            return Skeletor.Skelelang.i18n.get('no_lbl');
        }
        else {
            if (schema.labels && schema.labels.on) {
                return Skeletor.Skelelang.i18n.get(schema.labels.on + '_lbl');
            }
            return Skeletor.Skelelang.i18n.get('yes_lbl');
        }
    }
});


// Events
Template.skeleformCheckBox.onCreated(function() {
    Skeleform.utils.registerField(this);
    this.isActivated = new ReactiveVar(false);

    let schema = this.data.fieldSchema.get();

    Skeleform.utils.InvokeCallback(this, null, schema, 'onCreated');

    this.getValue = () => {
        let value = Skeleform.utils.$getFieldById(this, schema).prop('checked');

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
        Skeleform.utils.InvokeCallback(this, value, schema, 'onChange');
        Skeleform.utils.$getFieldById(this, schema).prop('checked', value);
    };
});
Template.skeleformCheckBox.onDestroyed(function() {
    let fields = this.data.formContext.fields;

    fields.removeAt(fields.indexOf(this));
});

Template.skeleformCheckBox.onRendered(function() {
    let schema = this.data.fieldSchema.get();

    this.isActivated.set(true);
    Skeleform.utils.InvokeCallback(this, null, schema, 'onRendered');

    // on checkboxes it is necessary to fire onChange on load since for "false" value, the "setValue()" never happens
    // because when creating new document, the relative item's field is undefined
    this.autorun((computation) => {
        if (this.data.formContext.skeleSubsReady.get()) {
            if (this.getValue() === false) {
                Skeleform.utils.InvokeCallback(this, false, schema, 'onChange', true);
                computation.stop();
            }
        }
    });
});


Template.skeleformCheckBox.events({
    'change .skeleValidate': function(event, instance) {
        // perform validation and callback invocation on change
        let value = instance.getValue();
        let schema = instance.data.fieldSchema.get();

        instance.isValid();
        Skeleform.utils.InvokeCallback(instance, value, schema, 'onChange', true);
    },
});
