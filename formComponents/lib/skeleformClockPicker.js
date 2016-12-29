// CLOCK PICKER
// an input field with clock plugin
// it uses materialize's version of clockpicker plugin for more informations: https://github.com/chingyawhao/materialize-clockpicker
// original clockpicker documentation: https://github.com/weareoutman/clockpicker

Template.skeleformClockPicker.helpers(skeleformGeneralHelpers);
Template.skeleformClockPicker.helpers({
    fieldClock: function(data, schema) {
        var template = Template.instance();
        console.log('exec0');

        // avoid setting the value if the view is not fully rendered yet
        if (template.view.isRendered) {
            var value = SkeleformStandardFieldValue(data, schema);
            console.log('exec');
            console.log(value);

            if (value !== template.getValue()) {
                // avoid empty strings since in that case moment will use current datetime as input;
                if (value === undefined || value.length === 0) return;

                console.log('view rendered');
                console.log(value);
                console.log($getField(template, schema).val());
                console.log('------------');

                value = moment(value, template.initOptions.formatSubmit).format(template.initOptions.format);
                $getField(template, schema).val(value);

                InvokeCallback(value, schema, 'onChange');
            }
        }
    }
});

Template.skeleformClockPicker.onCreated(function() {
    var self = this;
    var dataContext = self.data;

    self.initOptions = {};

    //register self on form' store
    dataContext.formInstance.Fields.push(self);

    // handle runtime translations and reset of the value
    Tracker.autorun(function() {
        // register language dependency
        var todayLbl = TAPi18n.__("pickadateButtons_labels").split(" ")[0];
        var schema = self.data.schema;

        /*if (self.pickerInstance) {
            self.initOptions.donetext = TAPi18n.__('pickadateButtons_labels').split(' ')[2];

            self.$('.clockpicker').clockpicker('remove');
            self.$('.clockpicker').clockpicker(self.initOptions);

            // set again the value to translate also in the input box
            var value = SkeleformStandardFieldValue(self.data.item, schema);

            if (!value) return;

            value = moment(value, self.initOptions.formatSubmit).format(self.initOptions.format);
            $getField(self, schema).val(value);
        }*/
    });

    self.getValue = function() {
        var value = moment(self.pickerInstance.val(), self.initOptions.format).format(self.initOptions.formatSubmit);

        return value;
    };
    self.isValid = function() {
        var formInstance = self.data.formInstance;

        return Skeleform.validate.checkOptions(self.getValue(), self.data.schema, formInstance.data.schema, formInstance.data.item);
    };
});

Template.skeleformClockPicker.onRendered(function() {
    var self = this;
    var data = self.data.item;
    var schema = this.data.schema;

    // activates validation on set
    self.initOptions = {};

    var options = schema.pickerOptions;

    // format used to display
    if (options && options.format) {
        self.initOptions.format = options.format;
    }
    else {
        self.initOptions.format = 'H:mm';
    }

    // format used for the value to be submitted
    if (options && options.formatSubmit) {
        self.initOptions.formatSubmit = options.formatSubmit;
    }
    else {
        self.initOptions.formatSubmit = 'HHmm';
    }

    // default time
    if (options && options.default) {
        self.initOptions.default = options.default;
    }
    else {
        self.initOptions.default = 'now';
    }

    // 12/24 hours
    if (options && options.twelvehour) {
        self.initOptions.twelvehour = options.twelvehour;
    }
    else {
        self.initOptions.twelvehour = false;
    }

    // autoclose
    if (options && options.autoclose) {
        self.initOptions.autoclose = options.autoclose;
    }
    else {
        self.initOptions.autoclose = true;
    }

    if (options) {
        // am/pm button clickable
        if (options.ampmclickable !== undefined) {
            self.initOptions.ampmclickable = options.ampmclickable;
        }

        // vibration on mobile devices while dragging
        if (options.vibrate !== undefined) {
            self.initOptions.vibrate = options.vibrate;
        }

        // popover placement
        if (options.placement !== undefined) {
            self.initOptions.placement = options.placement;
        }

        // popover arrow align
        if (options.align !== undefined) {
            self.initOptions.align = options.align;
        }

        // set default time to * milliseconds from now (using with default = 'now')
        if (options.fromnow !== undefined) {
            self.initOptions.fromnow = options.fromnow;
        }
    }

    self.pickerInstance = self.$('.clockpicker').clockpicker(self.initOptions);

    FlowRouter.subsReady(function() {
        var value = SkeleformStandardFieldValue(self.data.item, schema);

        if (value !== self.getValue()) {
            // avoid empty strings since in that case moment will use current datetime as input;
            if (value === undefined || value.length === 0) return;

            console.log('subs ready');
            console.log(value);
            console.log($getField(self, schema).val());
            console.log('------------');

            value = moment(value, self.initOptions.formatSubmit).format(self.initOptions.format);
            $getField(self, schema).val(value);

            InvokeCallback(value, schema, 'onChange');
        }
    });
});
