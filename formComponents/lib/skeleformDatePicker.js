// DATE PICKER
// an input field with calendar plugin
// it uses materialize's version of pickaday plugin for more informations: http://materializecss.com/forms.html
// pickaday parameters documentantion: http://amsul.ca/pickadate.js/date/
// pickaday api documentation: http://amsul.ca/pickadate.js/api/

Template.skeleformDatePicker.helpers(skeleformGeneralHelpers);
Template.skeleformDatePicker.helpers({
    fieldDate: function(data, schema) {
        const instance = Template.instance();

        setFieldValue(instance, data, schema);
    }
});

Template.skeleformDatePicker.onCreated(function() {
    this.isActivated = new ReactiveVar(false);

    let schema = this.data.schema.get();

    InvokeCallback(this, null, schema, 'onCreated');

    this.initOptions = {};

    this.i18n = () => {
        let pickerInstance = this.pickerInstance;

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

        //pickerInstance.render();
        // set again the value to translate also in the input box
        //pickerInstance.set('select', SkeleformStandardFieldValue(this.data.item, this.data.schema), {format: this.initOptions.formatSubmit});
        this.setValue(SkeleformStandardFieldValue(this.data.item, schema, this));
    };
    this.getValue = () => {
        let value = this.pickerInstance.get('select', this.initOptions.formatSubmit);

        return value;
    };
    this.isValid = () => {
        //SkeleUtils.GlobalUtilities.logger('datepicker validation', 'skeleformFieldValidation');
        let formInstance = this.data.formInstance;

        return Skeleform.validate.checkOptions(this.getValue(), schema, formInstance.data.schema, formInstance.data.item);
    };
    this.setValue = (value) => {
        // if setting a real value, fire onChange callback
        if (value !== undefined && value !== this.getValue()) {
            InvokeCallback(this, value, schema, 'onChange');
        }

        this.pickerInstance.set('select', value, {format: this.initOptions.formatSubmit});
    };
});
Template.skeleformDatePicker.onDestroyed(function() {
    let Fields = this.data.formInstance.Fields;

    Fields.removeAt(Fields.indexOf(this));
});

Template.skeleformDatePicker.onRendered(function() {
    let data = this.data.item;
    let schema = this.data.schema.get();
    let $element = $getFieldById(this, schema);

    registerField(this);

    // activates validation on set
    this.initOptions = {
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

        onSet: (context) => {
            // perform validation and callback invocation on change
            let value = this.getValue();

            // workaround to avoid multiple callback invocation on startup
            // if context.select is numeric -> setted by user, otherwise -> setted from db
            if (typeof(context.select) === 'number') {
                let result = this.isValid();
                let id = schema.name.replace('.', '\\.');

                if (!result.valid) {
                    setInvalid(id, schema, result);
                }
                else {
                    Skeleform.utils.skeleformSuccessStatus(id, schema);
                }

                InvokeCallback(this, value, schema, 'onChange');
            }

            // workaround for "closeOnSelect" option ignored by materializeCSS
            if (this.initOptions.closeOnSelect === undefined || this.initOptions.closeOnSelect === true) {
                //prevent closing on selecting month/year
                if ('select' in context) {
                    this.pickerInstance.close();
                }
            }
            /*
            let value = this.getValue();
            let result = this.isValid();
            let id = schema.name.replace('.', '\\.');

            console.log(value);

            if (!result.valid) {
                setInvalid(id, schema, result);
            }
            else {
                Skeleform.utils.skeleformSuccessStatus(id, schema);
            }

            InvokeCallback(this, value, schema, 'onChange');*/
        }
    };

    let options = schema.pickerOptions;

    // format used to display
    if (options && options.format) {
        this.initOptions.format = options.format;
    }
    else {
        this.initOptions.format = 'd mmmm yyyy';
    }

    // format used to submit
    if (options && options.formatSubmit) {
        this.initOptions.formatSubmit = options.formatSubmit;
    }
    else {
        this.initOptions.formatSubmit = 'yyyymmdd';
    }

    if (options) {
        // years and months dropdowns
        if (options.selectYears !== undefined) {
            this.initOptions.selectYears = options.selectYears;
        }
        if (options.selectMonths !== undefined) {
            this.initOptions.selectMonths = options.selectMonths;
        }

        // editable input box
        if (options.editable !== undefined) {
            this.initOptions.editable = options.editable;
        }

        // first day of the week
        if (options.firstDay !== undefined) {
            this.initOptions.firstDay = options.firstDay;
        }

        // date limits
        if (options.min !== undefined) {
            this.initOptions.min = options.min;
        }
        if (options.max !== undefined) {
            this.initOptions.max = options.max;
        }

        // disable dates
        if (options.disable !== undefined) {
            this.initOptions.disable = options.disable;
        }

        // close on user actions
        if (options.closeOnSelect !== undefined) {
            // actually ignored (materializeCSS customization to match google datepicker behavior
            this.initOptions.closeOnSelect = options.closeOnSelect;
        }
        if (options.closeOnClear !== undefined) {
            this.initOptions.closeOnClear = options.closeOnClear;
        }
    }

    $element.pickadate(this.initOptions);
    this.pickerInstance = $element.pickadate('picker');
    this.isActivated.set(true);
    InvokeCallback(this, null, schema, 'onRendered');
});

/*Template.skeleformDatePicker.events = {
    'change .datepicker': function(event, instance) {
        // perform validation and callback invocation on change
        let schema = instance.data.schema;
        let value = instance.getValue();
        let result = instance.isValid();
        let id = schema.name.replace('.', '\\.');

        console.log(value);

        if (!result.valid) {
            setInvalid(id, schema, result);
        }
        else {
            Skeleform.utils.skeleformSuccessStatus(id, schema);
        }

        InvokeCallback(instance, value, schema, 'onChange');
    }
};*/
