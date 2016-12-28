// TIME PICKER
// an input field with time plugin
// pickatime parameters documentantion: http://amsul.ca/pickadate.js/time/
// pickatime api documentation: http://amsul.ca/pickadate.js/api/

Template.skeleformTimePicker.helpers(skeleformGeneralHelpers);
Template.skeleformTimePicker.helpers({
    fieldTime: function(data, schema) {
        var pickerInstance = Template.instance().pickerInstance;
        var value = SkeleformStandardFieldValue(data, schema);

        if (!value) return;

        // reactively set the value on the timepicker
        if (pickerInstance) {
            pickerInstance.set('select', value, {format: Template.instance().initOptions.formatSubmit});
        }

        InvokeCallback(value, schema, 'onChange');
    }
});

Template.skeleformTimePicker.onCreated(function() {
    var self = this;
    var dataContext = self.data;

    self.initOptions = {};

    //register self on form' store
    dataContext.formInstance.Fields.push(self);

    Tracker.autorun(function() {
        // register language dependency
        var todayLbl = TAPi18n.__("pickadateButtons_labels").split(" ")[0];
        var value = SkeleformStandardFieldValue(self.data.item, self.data.schema);

        if (!value) return;

        if (self.pickerInstance) {
            self.pickerInstance.component.settings.clear = TAPi18n.__('pickadateButtons_labels').split(' ')[1];

            self.pickerInstance.render();
            // set again the value to translate also in the input box
            self.pickerInstance.set('select', value, {format: self.initOptions.formatSubmit});
        }
    });

    self.getValue = function() {
        var value = self.pickerInstance.get('select', self.initOptions.formatSubmit);

        return value;
    };
    self.isValid = function() {
        var formInstance = self.data.formInstance;

        return Skeleform.validate.checkOptions(self.getValue(), self.data.schema, formInstance.data.schema, formInstance.data.item);
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

            if (self.data) {
                skeleformValidateField(self);
            }

            InvokeCallback(value, schema, 'onChange');

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

    self.$('.timepicker').pickatime(self.initOptions);
    self.pickerInstance = self.$('.timepicker').pickatime('picker');

    FlowRouter.subsReady(function() {
        var value = self.getValue();

        InvokeCallback(value, schema, 'onChange');
    });
});