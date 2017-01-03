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


// Events
Template.skeleformInput.onCreated(function() {
    var self = this;
    self.isActivated = new ReactiveVar(false);
    var schema = self.data.schema;

    //register self on form' store
    self.data.formInstance.Fields.push(self);

    self.getValue = function() {
        var value = $getFieldId(self, schema).val();

        switch (schema.validation.type) {
            case 'url':
                value = value.dasherize();
                break;
        }

        return value;
    };
    self.isValid = function() {
        var formInstance = self.data.formInstance;

        return Skeleform.validate.checkOptions(self.getValue(), self.data.schema, formInstance.data.schema, formInstance.data.item);
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
    'keyup .skeleValidate': function(event, template) {
        var value = template.getValue();
        var schema = template.data.schema;

        skeleformValidateField(template);

        //autoRange option
        if (schema.autoRange && value.length === schema.validation.max) {
            $(event.target).select();
        }

        // if defined, perform the callback
        if (schema.callbacks && schema.callbacks.onChange) {
            schema.callbacks.onChange(value);
        }
    },
    'keyup .shadowField': function(event, template) {
        var shadowId = '#' + $(event.target).attr('id');
        var id = shadowId.substring(0, shadowId.indexOf('ShadowConfirm'));

        var value = template.getValue();
        var shadowValue = $(shadowId).val();

        skeleUtils.globalUtilities.logger('value: ' + value, 'skeleformFieldValidation');
        skeleUtils.globalUtilities.logger('shadowValue: ' + shadowValue, 'skeleformFieldValidation');
        if (value !== shadowValue) {
            skeleformErrorStatus(shadowId, TAPi18n.__("confirm_validation"));
        }
        else {
            skeleformSuccessStatus(shadowId);
        }
    }
});
