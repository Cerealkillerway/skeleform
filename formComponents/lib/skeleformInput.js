import { Random } from 'meteor/random'


// INPUT
// The standard input field
// it integrates autonumeric.js plugin to manage "formatAs" options
// see http://www.decorplanit.com/plugin/ for more details

// Helpers
Template.skeleformInput.helpers(skeleformGeneralHelpers);
Template.skeleformInput.helpers({
    inputType: function(renderAs) {
        if (!renderAs) return 'text';

        return renderAs.toLowerCase();
    }
});


handleGettedValue = function(value, schema) {
    if (!schema.validation) {
        return value;
    }

    switch (schema.validation.type) {
        case 'url':
            if (schema.shadowConfirm) {
                value.standard = value.standard.dasherize();
                value.shadow = value.shadow.dasherize();
            }
            else {
                value = value.dasherize();
            }
            break;
    }

    return value;
};


// Events
Template.skeleformInput.onCreated(function() {
    Skeleform.utils.registerField(this);
    this.isActivated = new ReactiveVar(false);

    let schema = this.data.fieldSchema.get();

    Skeleform.utils.InvokeCallback(this, null, schema, 'onCreated');

    this.getValue = () => {
        let value;

        if (schema.shadowConfirm) {
            value = {
                standard: Skeleform.utils.$getFieldById(this, schema).val(),
                shadow: $getShadowFieldId(this, schema).val()
            };
        }
        else {
            value = Skeleform.utils.$getFieldById(this, schema).val();
        }

        return handleGettedValue(value, schema);
    };

    this.isValid = () => {
        let formContext = this.data.formContext;
        let value = this.getValue();
        let validationResult = Skeleform.validate.checkOptions(value, schema, formContext.schema, formContext.item, this);

        if (schema.validation && schema.validation.unique === 'autoset') {
            let uniqueReasonIndex = validationResult.reasons.indexOf('unique');

            if (!validationResult.valid && uniqueReasonIndex >= 0) {
                this.setValue(value + '-' + Random.id());

                validationResult.reasons.removeAt(uniqueReasonIndex);

                if (validationResult.reasons.length === 0) {
                    validationResult.valid = true;
                }
            }
        }

        return validationResult;
    };

    this.setValue = (value) => {
        let $field = Skeleform.utils.$getFieldById(this, schema);

        Skeleform.utils.InvokeCallback(this, value, schema, 'onChange');
        $field.val(value);

        // when setting a value, trigger autoresize if it's a textarea
        // as documented on materialize's docs:
        // http://materializecss.com/forms.html
        if (schema.renderAs === 'textarea') {
            $field.trigger('autoresize');
        }
    };
});


Template.skeleformInput.onDestroyed(function() {
    let fields = this.data.formContext.fields;

    fields.removeAt(fields.indexOf(this));
});


Template.skeleformInput.onRendered(function() {
    let self = this;
    let schema = self.data.fieldSchema.get();
    let id = schema.name;
    let autoNumericDefaults = {
        currency: {
            aSep: ' ',
            aDec: ',',
            altDec: '.',
            aSign: '€',
            pSign: 's',
            vMax: '999.99',
            wEmpty: 'zero'
        },

        float: {
            aSep: ' ',
            aDec: ',',
            altDec: '.',
            vMax: '999.99',
            wEmpty: 'zero'
        },

        integer: {
            mDec: '0',
            vMax: '99',
            wEmpty: 'zero'
        }
    }

    // handle formats
    switch (schema.formatAs) {
        case 'currency':
            Skeleform.utils.$getFieldById(self, schema).autoNumeric('init', schema.autoNumericOptions || autoNumericDefaults.currency);

            Skeleform.utils.$getFieldById(self, schema).click(function() {
                $(this).select();
            });
            break;

        case 'float':
            Skeleform.utils.$getFieldById(self, schema).autoNumeric('init', schema.autoNumericOptions || autoNumericDefaults.float);
            break;

        case 'integer':
            Skeleform.utils.$getFieldById(self, schema).autoNumeric('init', schema.autoNumericOptions || autoNumericDefaults.integer);
            break;

        default:
            break;
    }

    // if necessary enable character counter
    if (schema.charCounter) {
        Skeleform.utils.$getFieldById(self, schema).characterCounter();
    }

    self.isActivated.set(true);
    Skeleform.utils.InvokeCallback(this, null, schema, 'onRendered');
});


Template.skeleformInput.events({
    'keyup .skeleValidate, keyup .shadowField': function(event, instance) {
        // perform validation and callback invocation on change
        let value = instance.getValue();
        let schema = instance.data.fieldSchema.get();
        let result = instance.isValid();
        let id = $(event.target).attr('id');

        if (!result.valid) {
            Skeleform.validate.setInvalid(id, schema, result);
        }
        else {
            Skeleform.validate.skeleformSuccessStatus(id, schema);
        }

        //autoRange option
        if (schema.autoRange && value.length === schema.validation.max) {
            $(event.target).select();
        }

        Skeleform.utils.InvokeCallback(instance, value, schema, 'onChange', true);
    }
});
