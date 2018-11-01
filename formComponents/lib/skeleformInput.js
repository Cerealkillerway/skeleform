import { Random } from 'meteor/random'


// INPUT
// The standard input field
// it integrates autonumeric.js plugin to manage "formatAs" options
// see http://www.decorplanit.com/plugin/ for more details


// function to handle autocomplete initialization
function initializeAutocomplete(fieldInstance, showSuggestions) {
    let schema = fieldInstance.data.fieldSchema.get();

    if (!schema.autocomplete) {
        return false;
    }

    let $field = Skeleform.utils.$getFieldById(fieldInstance, schema);
    let data;

    if (_.isFunction(schema.autocomplete.data)) {
        data = schema.autocomplete.data(fieldInstance.getValue());
    }
    else {
        if (isUpdating) {
            return false;
        }
        else {
            data = schema.autocomplete.data;
        }
    }

    let $container = fieldInstance.$('.autocompleteContainer').find('.collection');

    $container.empty();

    for (suggestion of data) {
        let $suggestion = $('<li />', {
            class: 'collection-item autocompleteSuggestion'
        });

        $suggestion.text(suggestion.name);

        if (suggestion.value) {
            $suggestion.data('value', suggestion.value);
        }
        if (suggestion.icon) {
            let $secondaryContent = $('<span />', {
                class: 'secondary-content'
            });
            let $icon = $('<i />', {
                class: 'material-icons'
            });

            $icon.text(suggestion.icon);
            $secondaryContent.append($icon);
            $suggestion.append($secondaryContent);
        }

        if (suggestion.image) {
            $suggestion.addClass('avatar');

            let $image = $('<img />', {
                class: 'circle',
                src: suggestion.image
            });

            $suggestion.prepend($image);
        }

        $container.append($suggestion);
    }

    if (showSuggestions) {
        fieldInstance.$('.autocompleteContainer').slideDown(200);
    }
}

// function to close suggestion list
function hideAutocomplete(fieldInstance) {
    fieldInstance.$('.autocompleteContainer').slideUp(200);
}


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
    let schema = self.data.fieldSchema.get();

    fields.removeAt(fields.indexOf(this));
});


Template.skeleformInput.onRendered(function() {
    let self = this;
    let schema = self.data.fieldSchema.get();
    let id = schema.name;
    let $field = Skeleform.utils.$getFieldById(self, schema);
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
            $field.autoNumeric('init', schema.autoNumericOptions || autoNumericDefaults.currency);

            $field.click(function() {
                $(this).select();
            });
            break;

        case 'float':
            $field.autoNumeric('init', schema.autoNumericOptions || autoNumericDefaults.float);
            break;

        case 'integer':
            $field.autoNumeric('init', schema.autoNumericOptions || autoNumericDefaults.integer);
            break;

        default:
            break;
    }

    // if necessary enable character counter
    if (schema.charCounter) {
        $field.characterCounter();
    }

    // if necessary handle autocomplete plugin
    initializeAutocomplete(self);
    if (schema.autocomplete && schema.autocomplete.maxHeight) {
        self.$('.autocompleteContainer').find('.collection').css({maxHeight: schema.autocomplete.maxHeight});
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

        // if necessary handle autocomplete update
        initializeAutocomplete(instance, true);

        Skeleform.utils.InvokeCallback(instance, value, schema, 'onChange', true);
    },

    'click .autocompleteSuggestion': function(event, instance) {
        event.stopPropagation();
        let $target = $(event.currentTarget);
        let value = $target.data('value');

        if (!value) {
            if ($target.find('img').length > 0) {
                value = $target.contents().get(1).nodeValue
            }
            else {
                value = $target.contents().get(0).nodeValue
            }
        }

        instance.setValue(value);
        instance.$('.autocompleteContainer').slideUp(200);
    },

    'focus input, focus textarea': function(event, instance) {
        let schema = instance.data.fieldSchema.get();

        if (schema.autocomplete && schema.autocomplete.showOnFocus) {
            initializeAutocomplete(instance, true);
        }
    },

    'blur input, blur textarea': function(event, instance) {
        setTimeout(() => {
            instance.$('.autocompleteContainer').slideUp(200);
        }, 300);
    }
});
