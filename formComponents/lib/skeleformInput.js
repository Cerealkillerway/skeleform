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
    //var self = this;
    this.isActivated = new ReactiveVar(false);
    let schema = this.data.schema;

    //register this on form' store
    this.data.formInstance.Fields.push(this);

    this.getValue = () => {
        let value;

        if (schema.shadowConfirm) {
            value = {
                standard: $getFieldId(this, schema).val(),
                shadow: $getShadowFieldId(this, schema).val()
            };
        }
        else {
            value = $getFieldId(this, schema).val();
        }

        return handleGettedValue(value, schema);
    };
    this.isValid = () => {
        let formInstance = this.data.formInstance;

        return Skeleform.validate.checkOptions(this.getValue(), this.data.schema, formInstance.data.schema, formInstance.data.item, this);
    };
    this.setValue = (value) => {
        let $field = $getFieldId(this, schema);

        $field.val(value);

        // when setting value trigger autoresize if it's a textarea
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
    let schema = self.data.schema;
    let id = schema.name;

    // handle formats
    switch (schema.formatAs) {
        case 'currency':
            $getFieldId(self, schema).autoNumeric('init', {
                aSep: ' ',
                aDec: ',',
                altDec: '.',
                aSign: '€',
                pSign: 's',
                vMax: '999.99',
                wEmpty: 'zero'
            });

            $getFieldId(self, schema).click(function() {
                $(this).select();
            });
            break;

        case 'float':
            $getFieldId(self, schema).autoNumeric('init', {
                aSep: ' ',
                aDec: ',',
                altDec: '.',
                vMax: '999.99',
                wEmpty: 'zero'
            });
            break;

        case 'integer':
            $getFieldId(self, schema).autoNumeric('init', {
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
        $getFieldId(self, schema).characterCounter();
    }

    self.isActivated.set(true);
});

Template.skeleformInput.events({
    'keyup .skeleValidate, keyup .shadowField': function(event, template) {
        // perform validation and callback invocation on change
        let value = template.getValue();
        let schema = template.data.schema;
        let result = template.isValid();
        let id = $(event.target).attr('id');

        if (!result.valid) {
            setInvalid(id, schema, result);
        }
        else {
            skeleformSuccessStatus(id, schema);
        }

        //autoRange option
        if (schema.autoRange && value.length === schema.validation.max) {
            $(event.target).select();
        }

        InvokeCallback(template, value, schema, 'onChange');
    }
});
