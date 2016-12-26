// DATE PICKER
// an input field with calendar plugin
// it uses materialize's version of pickaday plugin for more informations: http://materializecss.com/forms.html
// pickaday parameters documentantion: http://amsul.ca/pickadate.js/date/
// pickaday api documentation: http://amsul.ca/pickadate.js/api/
// implemented run-time override for reactivity in meteor.js (no hack in materialize' source files)

Template.skeleformDatePicker.helpers(skeleformGeneralHelpers);
Template.skeleformDatePicker.helpers({
    fieldDate: function(data, schema) {
        var pickerInstance = Template.instance().pickerInstance;

        // reactively set the value on the datepicker
        if (pickerInstance) {
            pickerInstance.set('select', SkeleformStandardFieldValue(data, schema), {format: Template.instance().initOptions.formatSubmit});
        }
    }
});

Template.skeleformDatePicker.onCreated(function() {
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

Template.skeleformDatePicker.onRendered(function() {
    var self = this;
    var data = self.data.item;
    var schema = this.data.schema;

    // activates validation on set
    self.initOptions = {
        monthsFull: TAPi18n.__("monthsFull_labels").split(' '),
        monthsShort: TAPi18n.__('monthsShort_labels').split(' '),
        weekdaysFull: TAPi18n.__('weekDaysFull_labels').split(' '),
        weekdaysShort: TAPi18n.__('weekDaysShort_labels').split(' '),
        weekdaysLetter: TAPi18n.__('weekDaysSingle_labels').split(' '),
        today: TAPi18n.__('pickadateButtons_labels').split(' ')[0],
        clear: TAPi18n.__('pickadateButtons_labels').split(' ')[1],
        close: TAPi18n.__('pickadateButtons_labels').split(' ')[2],
        labelMonthNext: TAPi18n.__('pickadateNav_next'),
        labelMonthPrev: TAPi18n.__('pickadateNav_prev'),
        labelMonthSelect: TAPi18n.__('monthSelect_label'),
        labelYearSelect: TAPi18n.__('yearSelect_label'),

        onSet: function() {
            var selected = self.pickerInstance.get('select', self.initOptions.formatSubmit);

            if (self.data) {
                skeleformValidateField(self);
            }
        }
    };

    var options = schema.pickerOptions;

    if (schema.pickerOptions) {
        // format used to display
        if (options.format) {
            self.initOptions.format = options.format;
        }

        // format used to submit
        if (options.formatSubmit) {
            self.initOptions.formatSubmit = options.formatSubmit;
        }

        // years and months dropdowns
        if (options.selectYears) {
            self.initOptions.selectYears = options.selectYears;
        }
        if (options.selectMonths) {
            self.initOptions.selectMonths = options.selectMonths;
        }

        // editable input box
        if (options.editable) {
            self.initOptions.editable = options.editable;
        }

        // first day of the week
        if (options.firstDay) {
            self.initOptions.firstDay = options.firstDay;
        }

        // date limits
        if (options.min) {
            self.initOptions.min = options.min;
        }
        if (options.max) {
            self.initOptions.max = options.max;
        }

        // disable dates
        if (options.disable) {
            self.initOptions.disable = options.disable;
        }
    }
    else {
        // defaults
        // format used to display
        self.initOptions.format = 'd mmmm yyyy';

        // format used to submit
        self.initOptions.formatSubmit = 'yyyymmdd';
    }

    self.$('.datepicker').pickadate(self.initOptions);
    self.pickerInstance = self.$('.datepicker').pickadate('picker');

    var value = SkeleformStandardFieldValue(data, schema);

    // if the value is already fetched, set it on the picker after plugin's initialization
    if (value) {
        self.pickerInstance.set('select', SkeleformStandardFieldValue(data, schema), {format: self.initOptions.formatSubmit});
    }
});
