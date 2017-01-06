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
    var self = this;
    self.isActivated = new ReactiveVar(false);
    var schema = self.data.schema;

    //register self on form' store
    self.data.formInstance.Fields.push(self);

    self.getValue = function() {
        var value;

        if (schema.shadowConfirm) {
            value = {
                standard: $getFieldId(self, schema).val(),
                shadow: $getShadowFieldId(self, schema).val()
            };
        }
        else {
            value = $getFieldId(self, schema).val();
        }

        return handleGettedValue(value, schema);
    };
    self.isValid = function() {
        var formInstance = self.data.formInstance;

        return Skeleform.validate.checkOptions(self.getValue(), self.data.schema, formInstance.data.schema, formInstance.data.item, self);
    };
    self.setValue = function(value) {
        $getFieldId(self, schema).val(value);
    };
});
Template.skeleformInput.onRendered(function() {
    var self = this;
    var schema = self.data.schema;
    var id = schema.name;

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
        var value = template.getValue();
        var schema = template.data.schema;
        var result = template.isValid();
        var id = $(event.target).attr('id');

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
