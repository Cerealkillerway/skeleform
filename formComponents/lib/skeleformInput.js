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
    this.isActivated = new ReactiveVar(false);

    let schema = this.data.schema.get();

    InvokeCallback(this, null, schema, 'onCreated');

    this.getValue = () => {
        let value;

        if (schema.shadowConfirm) {
            value = {
                standard: $getFieldById(this, schema).val(),
                shadow: $getShadowFieldId(this, schema).val()
            };
        }
        else {
            value = $getFieldById(this, schema).val();
        }

        return handleGettedValue(value, schema);
    };
    this.isValid = () => {
        let formInstance = this.data.formInstance;
        let value = this.getValue();
        let validationResult = Skeleform.validate.checkOptions(value, schema, formInstance.data.schema, formInstance.data.item, this);

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
        let $field = $getFieldById(this, schema);

        $field.val(value);

        // if setting a real value, fire onChange callback
        if (value !== undefined && value !== this.getValue()) {
            InvokeCallback(this, value, schema, 'onChange');
        }

        // when setting a value, trigger autoresize if it's a textarea
        // as documented on materialize's docs:
        // http://materializecss.com/forms.html
        if (schema.renderAs === 'textarea') {
            $field.trigger('autoresize');
        }
    };
});


Template.skeleformInput.onDestroyed(function() {
    let Fields = this.data.formInstance.Fields;

    Fields.removeAt(Fields.indexOf(this));
});


Template.skeleformInput.onRendered(function() {
    let self = this;
    let schema = self.data.schema.get();
    let id = schema.name;

    SkeleUtils.GlobalUtilities.logger('Calling again registerField', 'skeleWarning');
    registerField(this);

    // handle formats
    switch (schema.formatAs) {
        case 'currency':
            $getFieldById(self, schema).autoNumeric('init', {
                aSep: ' ',
                aDec: ',',
                altDec: '.',
                aSign: '€',
                pSign: 's',
                vMax: '999.99',
                wEmpty: 'zero'
            });

            $getFieldById(self, schema).click(function() {
                $(this).select();
            });
            break;

        case 'float':
            $getFieldById(self, schema).autoNumeric('init', {
                aSep: ' ',
                aDec: ',',
                altDec: '.',
                vMax: '999.99',
                wEmpty: 'zero'
            });
            break;

        case 'integer':
            $getFieldById(self, schema).autoNumeric('init', {
                mDec: '0',
                vMax: '99',
                wEmpty: 'zero'
            });
            break;

        default:
            break;
    }

    // if necessary enable character counter
    if (schema.charCounter) {
        $getFieldById(self, schema).characterCounter();
    }

    self.isActivated.set(true);
    InvokeCallback(this, null, schema, 'onRendered');
});

Template.skeleformInput.events({
    'keyup .skeleValidate, keyup .shadowField': function(event, instance) {
        // perform validation and callback invocation on change
        let value = instance.getValue();
        let schema = instance.data.schema.get();
        let result = instance.isValid();
        let id = $(event.target).attr('id');

        if (!result.valid) {
            setInvalid(id, schema, result);
        }
        else {
            Skeleform.utils.skeleformSuccessStatus(id, schema);
        }

        //autoRange option
        if (schema.autoRange && value.length === schema.validation.max) {
            $(event.target).select();
        }

        InvokeCallback(instance, value, schema, 'onChange');
    }
});
