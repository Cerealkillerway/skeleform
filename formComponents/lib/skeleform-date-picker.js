// DATE PICKER
// an input field with calendar plugin
// it uses materialize's version of pickaday plugin for more informations: http://materializecss.com/forms.html
// pickaday parameters documentantion: http://amsul.ca/pickadate.js/date/
// pickaday api documentation: http://amsul.ca/pickadate.js/api/

Template.skeleformDatePicker.helpers(skeleformGeneralHelpers);


Template.skeleformDatePicker.onCreated(function() {
    Skeleform.utils.registerField(this);
    this.isActivated = new ReactiveVar(false);

    let schema = this.data.fieldSchema.get();

    Skeleform.utils.InvokeCallback(this, null, schema, 'onCreated');

    this.initOptions = {};

    this.i18n = () => {
        let pickerInstance = this.pickerInstance;

        pickerInstance.component.settings.monthsFull = Skeletor.Skelelang.i18n.get('monthsFull_labels').split(' ');
        pickerInstance.component.settings.monthsShort = Skeletor.Skelelang.i18n.get('monthsShort_labels').split(' ');
        pickerInstance.component.settings.weekdaysFull = Skeletor.Skelelang.i18n.get('weekDaysFull_labels').split(' ');
        pickerInstance.component.settings.weekdaysShort = Skeletor.Skelelang.i18n.get('weekDaysShort_labels').split(' ');
        pickerInstance.component.settings.weekdaysLetter = Skeletor.Skelelang.i18n.get('weekDaysSingle_labels').split(' ');
        pickerInstance.component.settings.today = Skeletor.Skelelang.i18n.get('pickadateButtons_labels').split(' ')[0];
        pickerInstance.component.settings.clear = Skeletor.Skelelang.i18n.get('pickadateButtons_labels').split(' ')[1];
        pickerInstance.component.settings.close = Skeletor.Skelelang.i18n.get('pickadateButtons_labels').split(' ')[2];
        pickerInstance.component.settings.labelMonthNext = Skeletor.Skelelang.i18n.get('pickadateNav_next');
        pickerInstance.component.settings.labelMonthPrev = Skeletor.Skelelang.i18n.get('pickadateNav_prev');
        pickerInstance.component.settings.labelMonthSelect = Skeletor.Skelelang.i18n.get('monthSelect_label');
        pickerInstance.component.settings.labelYearSelect = Skeletor.Skelelang.i18n.get('yearSelect_label');

        //pickerInstance.render();
        // set again the value to translate also in the input box
        //pickerInstance.set('select', Skeleform.utils.SkeleformStandardFieldValue(this.data.item, this.data.schema), {format: this.initOptions.formatSubmit});
        this.setValue(Skeleform.utils.SkeleformStandardFieldValue(this.data.formContext.item, schema, this));
    };
    this.getValue = () => {
        let value = this.pickerInstance.get('select', this.initOptions.formatSubmit);

        return value;
    };
    this.isValid = () => {
        //Skeletor.SkeleUtils.GlobalUtilities.logger('datepicker validation', 'skeleformFieldValidation');
        let formContext = this.data.formContext;

        return Skeleform.validate.checkOptions(this.getValue(), schema, formContext.schema, formContext.item);
    };
    this.setValue = (value) => {
        this.pickerInstance.set('select', value, {format: this.initOptions.formatSubmit});
        Skeleform.utils.InvokeCallback(this, value, schema, 'onChange');
    };
});
Template.skeleformDatePicker.onDestroyed(function() {
    let fields = this.data.formContext.fields;

    fields.removeAt(fields.indexOf(this));
});

Template.skeleformDatePicker.onRendered(function() {
    let data = this.data.item;
    let schema = this.data.fieldSchema.get();
    let $element = Skeleform.utils.$getFieldById(this, schema);

    // activates validation on set
    this.initOptions = {
        monthsFull: Skeletor.Skelelang.i18n.get("monthsFull_labels").split(' '),
        monthsShort: Skeletor.Skelelang.i18n.get('monthsShort_labels').split(' '),
        weekdaysFull: Skeletor.Skelelang.i18n.get('weekDaysFull_labels').split(' '),
        weekdaysShort: Skeletor.Skelelang.i18n.get('weekDaysShort_labels').split(' '),
        weekdaysLetter: Skeletor.Skelelang.i18n.get('weekDaysSingle_labels').split(' '),
        today: Skeletor.Skelelang.i18n.get('pickadateButtons_labels').split(' ')[0],
        clear: Skeletor.Skelelang.i18n.get('pickadateButtons_labels').split(' ')[1],
        close: Skeletor.Skelelang.i18n.get('pickadateButtons_labels').split(' ')[2],
        labelMonthNext: Skeletor.Skelelang.i18n.get('pickadateNav_next'),
        labelMonthPrev: Skeletor.Skelelang.i18n.get('pickadateNav_prev'),
        labelMonthSelect: Skeletor.Skelelang.i18n.get('monthSelect_label'),
        labelYearSelect: Skeletor.Skelelang.i18n.get('yearSelect_label'),

        onSet: (context) => {
            // perform validation and callback invocation on change
            let value = this.getValue();

            // workaround to avoid multiple callback invocation on startup
            // if context.select is numeric -> setted by user, otherwise -> setted from db
            if (typeof(context.select) === 'number') {
                let result = this.isValid();
                let id = schema.name.replace('.', '\\.');

                if (!result.valid) {
                    Skeleform.validate.setInvalid(id, schema, result, this);
                }
                else {
                    Skeleform.validate.skeleformSuccessStatus(id, schema);
                }

                Skeleform.utils.InvokeCallback(this, value, schema, 'onChange', true);
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
                Skeleform.validate.setInvalid(id, schema, result);
            }
            else {
                Skeleform.validate.skeleformSuccessStatus(id, schema);
            }

            Skeleform.utils.InvokeCallback(this, value, schema, 'onChange');*/
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
    Skeleform.utils.InvokeCallback(this, null, schema, 'onRendered');
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
            Skeleform.validate.setInvalid(id, schema, result);
        }
        else {
            Skeleform.validate.skeleformSuccessStatus(id, schema);
        }

        Skeleform.utils.InvokeCallback(instance, value, schema, 'onChange');
    }
};*/
