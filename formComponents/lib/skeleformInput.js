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
    var dataContext = self.data;

    //register self on form' store
    dataContext.formInstance.Fields.push(self);

    self.getValue = function() {
        var value = $('#' + dataContext.schema.name.replace('.', '\\.')).val();

        switch (self.data.schema.validation.type) {
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
});
Template.skeleformInput.onRendered(function() {
    var schema = this.data.schema;
    var id = schema.name;

    switch (schema.formatAs) {
        case 'currency':
            $('#' + id).autoNumeric('init', {
                aSep: ' ',
                aDec: ',',
                altDec: '.',
                aSign: '€',
                pSign: 's',
                vMax: '999.99',
                wEmpty: 'zero'
            });

            $('#' + id).click(function() {
                $(this).select();
            });
            break;

        case 'float':
            $('#' + id).autoNumeric('init', {
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
});

Template.skeleformInput.events({
    "keyup .skeleValidate": function(event, template) {
        var value = $(event.target).val();
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
    "keyup .shadowField": function(event, template) {
        var shadowId = '#' + $(event.target).attr('id');
        var id = shadowId.substring(0, shadowId.indexOf('ShadowConfirm'));

        var value = $(id).val();
        var shadowValue = $(event.target).val();


        if (value !== shadowValue) {
            skeleformErrorStatus(shadowId, TAPi18n.__("confirm_validation"));
        }
        else {
            skeleformSuccessStatus(shadowId);
        }
    }
});
