// DATE PICKER
// an input field with calendar plugin
// it uses materialize's version of pickaday plugin for more informations: http://materializecss.com/forms.html
// pickaday parameters documentantion: http://amsul.ca/pickadate.js/date/
// pickaday api documentation: http://amsul.ca/pickadate.js/api/
// implemented run-time override for reactivity in meteor.js (no hack in materialize' source files)

Template.skeleformTimePicker.helpers(skeleformGeneralHelpers);
Template.skeleformTimePicker.helpers({
    fieldDate: function(data, schema) {
        var pickerInstance = Template.instance().pickerInstance;

        // reactively set the value on the timepicker
        if (pickerInstance) {
            pickerInstance.set('select', SkeleformStandardFieldValue(data, schema), {format: Template.instance().initOptions.formatSubmit});
        }
    }
});

Template.skeleformTimePicker.onCreated(function() {
    var self = this;
    var dataContext = self.data;

    self.initOptions = {};

    //register self on form' store
    dataContext.formInstance.Fields.push(self);

    Tracker.autorun(function() {
        var todayLbl = TAPi18n.__("pickadateButtons_labels").split(" ")[0]; //register language dependency

        if (self.pickerInstance) {
            self.pickerInstance.component.settings.monthsFull = TAPi18n.__('monthsFull_labels').split(' ');
            self.pickerInstance.component.settings.monthsShort = TAPi18n.__('monthsShort_labels').split(' ');
            self.pickerInstance.component.settings.weekdaysFull = TAPi18n.__('weekDaysFull_labels').split(' ');
            self.pickerInstance.component.settings.weekdaysShort = TAPi18n.__('weekDaysShort_labels').split(' ');
            self.pickerInstance.component.settings.weekdaysLetter = TAPi18n.__('weekDaysSingle_labels').split(' ');
            self.pickerInstance.component.settings.today = TAPi18n.__('pickadateButtons_labels').split(' ')[0];
            self.pickerInstance.component.settings.clear = TAPi18n.__('pickadateButtons_labels').split(' ')[1];
            self.pickerInstance.component.settings.close = TAPi18n.__('pickadateButtons_labels').split(' ')[2];
            self.pickerInstance.component.settings.labelMonthNext = TAPi18n.__('pickadateNav_next');
            self.pickerInstance.component.settings.labelMonthPrev = TAPi18n.__('pickadateNav_prev');
            self.pickerInstance.component.settings.labelMonthSelect = TAPi18n.__('monthSelect_label');
            self.pickerInstance.component.settings.labelYearSelect = TAPi18n.__('yearSelect_label');

            self.pickerInstance.render();
            // set again the value to translate also in the input box
            self.pickerInstance.set('select', SkeleformStandardFieldValue(self.data.item, self.data.schema), {format: self.initOptions.formatSubmit});
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

        onSet: function() {
            var value = self.pickerInstance.get('select', self.initOptions.formatSubmit);

            if (self.data) {
                skeleformValidateField(self);
            }

            // if defined, perform the callback
            if (schema.callbacks && schema.callbacks.onChange) {
                schema.callbacks.onChange(value);
            }
        }
    };

    var options = schema.pickerOptions;

    if (schema.pickerOptions) {

    }
    else {

    }

    self.$('.timepicker').pickatime(self.initOptions);
    self.pickerInstance = self.$('.timepicker').pickatime('picker');

    var value = SkeleformStandardFieldValue(data, schema);

    // if the value is already fetched, set it on the picker after plugin's initialization
    if (value) {
        self.pickerInstance.set('select', SkeleformStandardFieldValue(data, schema), {format: self.initOptions.formatSubmit});
    }
});
