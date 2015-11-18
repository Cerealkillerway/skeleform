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
        if (schema.autoRange && value.length === schema.max) $(event.target).select();

        //enabled shadowConfirm if required
        /*if (schema.shadowConfirm) {
            var shadowField = $('#' +  schema.name + 'Shadow');

            if (value.length > 0) {            
                shadowField.removeClass('hidden');
                shadowField.animate({opacity: 1}, 200); 
            }
            else {
                shadowField.animate({opacity: 0}, 200, function() {
                    shadowField.addClass('hidden');
                });
            }
        }*/

        //enabled old value confirm if required
        /*if (schema.oldValueConfirm) {
            var oldField = $('#' +  schema.name + 'OldGroup');

            if (value.length > 0) {            
                oldField.removeClass('hidden');
                oldField.animate({opacity: 1}, 200); 
            }
            else {
                oldField.animate({opacity: 0}, 200, function() {
                    oldField.addClass('hidden');
                });
            }
        }*/

        //restore gather class if the field is not empty
        /*if (schema.renderAs === 'password') {
            if (value.length > 0) $(event.target).addClass('gather');
            else {
                $(event.target).removeClass('gather');
                skeleformResetStatus(schema.name);
            }
        }*/
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

    // remove gather class if renderAs = 'password'
    // to avoid sending empty password to the update method
    if (schema.renderAs === 'password') {
        this.$('.gather').removeClass('gather');
    }

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