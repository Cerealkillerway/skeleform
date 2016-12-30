// DATE PICKER
// an input field with calendar plugin
// it uses materialize's version of pickaday plugin for more informations: http://materializecss.com/forms.html
// pickaday parameters documentantion: http://amsul.ca/pickadate.js/date/
// pickaday api documentation: http://amsul.ca/pickadate.js/api/

Template.skeleformDatePicker.helpers(skeleformGeneralHelpers);
Template.skeleformDatePicker.helpers({
    fieldDate: function(data, schema) {
        var template = Template.instance();

        setFieldValue(template, data, schema);
    }
});

Template.skeleformDatePicker.onCreated(function() {
    var self = this;
    self.isActivated = new ReactiveVar(false);

    self.initOptions = {};

    //register self on form' store
    self.data.formInstance.Fields.push(self);

    self.i18n = function() {
        var pickerInstance = self.pickerInstance;

        pickerInstance.component.settings.monthsFull = TAPi18n.__('monthsFull_labels').split(' ');
        pickerInstance.component.settings.monthsShort = TAPi18n.__('monthsShort_labels').split(' ');
        pickerInstance.component.settings.weekdaysFull = TAPi18n.__('weekDaysFull_labels').split(' ');
        pickerInstance.component.settings.weekdaysShort = TAPi18n.__('weekDaysShort_labels').split(' ');
        pickerInstance.component.settings.weekdaysLetter = TAPi18n.__('weekDaysSingle_labels').split(' ');
        pickerInstance.component.settings.today = TAPi18n.__('pickadateButtons_labels').split(' ')[0];
        pickerInstance.component.settings.clear = TAPi18n.__('pickadateButtons_labels').split(' ')[1];
        pickerInstance.component.settings.close = TAPi18n.__('pickadateButtons_labels').split(' ')[2];
        pickerInstance.component.settings.labelMonthNext = TAPi18n.__('pickadateNav_next');
        pickerInstance.component.settings.labelMonthPrev = TAPi18n.__('pickadateNav_prev');
        pickerInstance.component.settings.labelMonthSelect = TAPi18n.__('monthSelect_label');
        pickerInstance.component.settings.labelYearSelect = TAPi18n.__('yearSelect_label');

        pickerInstance.render();
        // set again the value to translate also in the input box
        //pickerInstance.set('select', SkeleformStandardFieldValue(self.data.item, self.data.schema), {format: self.initOptions.formatSubmit});
        self.setValue(SkeleformStandardFieldValue(self.data.item, self.data.schema));
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
        self.pickerInstance.set('select', value, {format: Template.instance().initOptions.formatSubmit});
    };
});

Template.skeleformDatePicker.onRendered(function() {
    var self = this;
    var data = self.data.item;
    var schema = this.data.schema;
    var $element = $getFieldId(self, schema);

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

        onSet: function(context) {
            // workaround for "closeOnSelect" option ignored by materializeCSS
            if (self.initOptions.closeOnSelect === undefined || self.initOptions.closeOnSelect === true) {
                //prevent closing on selecting month/year
                if ('select' in context) {
                    this.close();
                }
            }
        }
    };

    var options = schema.pickerOptions;

    // format used to display
    if (options && options.format) {
        self.initOptions.format = options.format;
    }
    else {
        self.initOptions.format = 'd mmmm yyyy';
    }

    // format used to submit
    if (options && options.formatSubmit) {
        self.initOptions.formatSubmit = options.formatSubmit;
    }
    else {
        self.initOptions.formatSubmit = 'yyyymmdd';
    }

    if (options) {
        // years and months dropdowns
        if (options.selectYears !== undefined) {
            self.initOptions.selectYears = options.selectYears;
        }
        if (options.selectMonths !== undefined) {
            self.initOptions.selectMonths = options.selectMonths;
        }

        // editable input box
        if (options.editable !== undefined) {
            self.initOptions.editable = options.editable;
        }

        // first day of the week
        if (options.firstDay !== undefined) {
            self.initOptions.firstDay = options.firstDay;
        }

        // date limits
        if (options.min !== undefined) {
            self.initOptions.min = options.min;
        }
        if (options.max !== undefined) {
            self.initOptions.max = options.max;
        }

        // disable dates
        if (options.disable !== undefined) {
            self.initOptions.disable = options.disable;
        }

        // close on user actions
        if (options.closeOnSelect !== undefined) {
            // actually ignored (materializeCSS customization to match google datepicker behavior
            self.initOptions.closeOnSelect = options.closeOnSelect;
        }
        if (options.closeOnClear !== undefined) {
            self.initOptions.closeOnClear = options.closeOnClear;
        }
    }

    $element.pickadate(self.initOptions);
    self.pickerInstance = $element.pickadate('picker');
    self.isActivated.set(true);
});
