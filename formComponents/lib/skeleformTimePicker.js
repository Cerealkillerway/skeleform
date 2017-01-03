// TIME PICKER
// an input field with time plugin
// pickatime parameters documentantion: http://amsul.ca/pickadate.js/time/
// pickatime api documentation: http://amsul.ca/pickadate.js/api/

Template.skeleformTimePicker.helpers(skeleformGeneralHelpers);
Template.skeleformTimePicker.helpers({
    fieldTime: function(data, schema) {
        var template = Template.instance();

        setFieldValue(template, data, schema);
    }
});

Template.skeleformTimePicker.onCreated(function() {
    var self = this;
    self.isActivated = new ReactiveVar(false);
    self.initOptions = {};

    //register self on form' store
    self.data.formInstance.Fields.push(self);

    self.i18n = function(currentLang) {
        self.pickerInstance.component.settings.clear = TAPi18n.__('pickadateButtons_labels').split(' ')[1];
        self.pickerInstance.render();
    };
    self.getValue = function() {
        var value = self.pickerInstance.get('select', self.initOptions.formatSubmit);

        return value;
    };
    self.isValid = function() {
        var formInstance = self.data.formInstance;

        return Skeleform.validate.checkOptions(self.getValue(), self.data.schema, formInstance.data.schema, formInstance.data.item);
    };
    self.setValue = function(value) {
        var pickerInstance = Template.instance().pickerInstance;

        if (!value) return;

        // reactively set the value on the timepicker
        if (pickerInstance) {
            pickerInstance.set('select', value, {format: Template.instance().initOptions.formatSubmit});
        }

    };
});

Template.skeleformTimePicker.onRendered(function() {
    var self = this;
    var data = self.data.item;
    var schema = this.data.schema;

    // activates validation on set
    self.initOptions = {

        onSet: function(context) {
            var value = self.getValue();

            self.isValid();
            InvokeCallback(self, value, schema, 'onChange');

            // workaround for "closeOnSelect" option ignored by materializeCSS
            if (self.initOptions.closeOnSelect === undefined || self.initOptions.closeOnSelect === true) {
                //prevent closing on selecting month/year
                this.close();
            }
        }
    };

    var options = schema.pickerOptions;

    // format used to display
    if (options && options.format) {
        self.initOptions.format = options.format;
    }
    else {
        self.initOptions.format = 'H:i';
    }

    // format used for the labels in the picker
    if (options && options.formatLabel) {
        self.initOptions.formatLabel = options.formatLabel;
    }
    else {
        self.initOptions.formatLabel = ' <b>H</b> : i';
    }

    // format used for the value to be submitted
    if (options && options.formatSubmit) {
        self.initOptions.formatSubmit = options.formatSubmit;
    }
    else {
        self.initOptions.formatSubmit = 'HHi';
    }

    if (options) {
        // editable input box
        if (options.editable !== undefined) {
            self.initOptions.editable = options.editable;
        }

        // minutes between each value in the list
        if (options.interval !== undefined) {
            self.initOptions.interval = options.interval;
        }

        // time limits
        if (options.min !== undefined) {
            self.initOptions.min = options.min;
        }
        if (options.max !== undefined) {
            self.initOptions.max = options.max;
        }

        // disable times
        if (options.disable !== undefined) {
            self.initOptions.disable = options.disable;
        }

        // close on user actions
        if (options.closeOnSelect !== undefined) {
            // actually ignored (materializeCSS customization to match google datepicker behavior)
            self.initOptions.closeOnSelect = options.closeOnSelect;
        }
        if (options.closeOnClear !== undefined) {
            self.initOptions.closeOnClear = options.closeOnClear;
        }
    }

    var $field = $getFieldId(self, self.data.schema);

    $field.pickatime(self.initOptions);
    self.pickerInstance = $field.pickatime('picker');
    self.isActivated.set(true);
});
