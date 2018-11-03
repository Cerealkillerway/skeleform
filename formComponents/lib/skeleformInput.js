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
        data = schema.autocomplete.data(fieldInstance.getValue(), fieldInstance.getBoxValue(), fieldInstance);
    }
    else {
        data = schema.autocomplete.data;
    }

    if (!data) {
        return false;
    }

    let $container = fieldInstance.$('.autocompleteContainer').find('.collection');

    $container.empty();

    function setSuggestions(suggestionData) {
        for (suggestion of suggestionData) {
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

    if (SkeleUtils.GlobalUtilities.isPromise(data)) {
        data.then((result) => {
            console.log(result);
            setSuggestions(result);
        });
    }
    else {
        setSuggestions(data);
    }
}

// function to close suggestion list
function hideAutocomplete(fieldInstance) {
    fieldInstance.$('.autocompleteContainer').slideUp(200);
}

// function to create selected placeholder for autocomplete with multiple option
function appendSelected(instance, name, value) {
    let $selectedContainer = instance.$('.autocompleteSelected');
    let $item = $('<div />', {
        class: 'selectedSuggestion'
    });
    let $closeIcon = $('<i />', {
        class: 'material-icons deleteSuggestion'
    });

    $item.text(name);
    $item.attr('data-value', value);
    $closeIcon.text('close');
    $item.append($closeIcon);

    $selectedContainer.append($item);

    if ($selectedContainer.hasClass('hide')) {
        $selectedContainer.removeClass('hide');
    }
}

// gets the standard input value
function getBoxValue(instance, schema) {
    if (schema.shadowConfirm) {
        value = {
            standard: Skeleform.utils.$getFieldById(instance, schema).val(),
            shadow: $getShadowFieldId(instance, schema).val()
        };
    }
    else {
        value = Skeleform.utils.$getFieldById(instance, schema).val();
    }

    return handleGettedValue(value, schema);
}

// handle needed validation transformations
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
    Skeleform.utils.registerField(this);
    this.isActivated = new ReactiveVar(false);

    let schema = this.data.fieldSchema.get();

    Skeleform.utils.InvokeCallback(this, null, schema, 'onCreated');

    this.getValue = () => {
        let value;

        if (schema.autocomplete && schema.autocomplete.multiple) {
            let $selectedContainer = this.$('.autocompleteSelected');

            value = [];

            for (selected of $selectedContainer.find('.selectedSuggestion')) {
                let $selected = $(selected);

                value.push($selected.data('value'));
            }

            return value;
        }
        else {
            return getBoxValue(this, schema);
        }
    };

    this.getBoxValue = () => {
        return getBoxValue(this, schema);
    },

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

        if (schema.autocomplete && schema.autocomplete.multiple) {
            this.$('.autocompleteSelected').empty();

            if (!value) {
                return false;
            }
            for (selected of value) {
                let name;

                if (schema.autocomplete.getName) {
                    name = schema.autocomplete.getName(selected);
                }
                else {
                    name = selected;
                }
                appendSelected(this, name, selected);
            }
        }
        else {
            $field.val(value);
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
    let fields = this.data.formContext.fields;

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
        let schema = instance.data.fieldSchema.get();
        let name;

        if ($target.find('img').length > 0) {
            name = $target.contents().get(1).nodeValue
        }
        else {
            name = $target.contents().get(0).nodeValue
        }

        // case multiple values
        if (schema.autocomplete.multiple) {
            appendSelected(instance, name, value);
        }
        // case single value
        else {
            if (value) {
                instance.setValue(value);
            }
            else {
                instance.setValue(name);
            }
        }

        instance.$('.autocompleteContainer').slideUp(200);
    },

    'click .deleteSuggestion': function(event, instance) {
        let $target = $(event.currentTarget);
        let $selectedContainer = instance.$('.autocompleteSelected');

        $target.parent('.selectedSuggestion').remove();

        if ($selectedContainer.children().length === 0) {
            $selectedContainer.addClass('hide');
        }
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
