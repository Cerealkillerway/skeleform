// INPUT
// The standard input field
// it integrates autonumeric.js plugin to manage "formatAs" options
// see http://www.decorplanit.com/plugin/ for more details

Template.skeleformInput.helpers(skeleformGeneralHelpers);
Template.skeleformInput.helpers({
    inputType: function(renderAs) {
        if (!renderAs) return 'text';
        return renderAs.toLowerCase();
    }
});

Template.skeleformInput.events({
    "keyup .skeleValidate": function(event, template) {
        var schema = template.data.schema;
        var value = $(event.target).val();

        switch (schema.type) {

            case 'url':
                value = value.dasherize();
                $(event.target).val(value);
                break;

            default:
                break;
        }

        skeleformValidateField(value, template.data);

        //autoRange option
        if (schema.autoRange && value.length === schema.max) {
            $(event.target).select();
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

Template.skeleformInput.rendered = function() {
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
};