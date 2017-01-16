// TIME PICKER
// an input field with time plugin
// pickatime parameters documentantion: http://amsul.ca/pickadate.js/time/
// pickatime api documentation: http://amsul.ca/pickadate.js/api/

Template.skeleformTimePicker.helpers(skeleformGeneralHelpers);
Template.skeleformTimePicker.helpers({
    fieldTime: function(data, schema) {
        const instance = Template.instance();

        setFieldValue(instance, data, schema);
    }
});

Template.skeleformTimePicker.onCreated(function() {
    this.isActivated = new ReactiveVar(false);
    this.initOptions = {};

    //register this on form' store
    this.data.formInstance.Fields.push(this);

    this.i18n = (currentLang) => {
        this.pickerInstance.component.settings.clear = TAPi18n.__('pickadateButtons_labels').split(' ')[1];
        this.pickerInstance.render();
    };
    this.getValue = () => {
        let value = this.pickerInstance.get('select', this.initOptions.formatSubmit);

        return value;
    };
    this.isValid = () => {
        let formInstance = this.data.formInstance;

        return Skeleform.validate.checkOptions(this.getValue(), this.data.schema, formInstance.data.schema, formInstance.data.item);
    };
    this.setValue = (value) => {
        const instance = Template.instance();
        let pickerInstance = instance.pickerInstance;

        if (!value) return;

        // reactively set the value on the timepicker
        if (pickerInstance) {
            pickerInstance.set('select', value, {format: instance.initOptions.formatSubmit});
        }

    };
});
Template.skeleformTimePicker.onDestroyed(function() {
    let Fields = this.data.formInstance.Fields;

    Fields.removeAt(Fields.indexOf(this));
});

Template.skeleformTimePicker.onRendered(function() {
    let data = this.data.item;
    let schema = this.data.schema;
    this.setCounter = 0;

    // activates validation on set
    this.initOptions = {

        onSet: (context) => {
            let value = this.getValue();

            this.isValid();

            // workaround to avoid multiple callback invocation on startup
            if (this.setCounter > 0) {
                InvokeCallback(this, value, schema, 'onChange');
            }
            this.setCounter++;

            // workaround for "closeOnSelect" option ignored by materializeCSS
            if (this.initOptions.closeOnSelect === undefined || this.initOptions.closeOnSelect === true) {
                //prevent closing on selecting month/year
                this.pickerInstance.close();
            }
        }
    };

    var options = schema.pickerOptions;

    // format used to display
    if (options && options.format) {
        this.initOptions.format = options.format;
    }
    else {
        this.initOptions.format = 'H:i';
    }

    // format used for the labels in the picker
    if (options && options.formatLabel) {
        this.initOptions.formatLabel = options.formatLabel;
    }
    else {
        this.initOptions.formatLabel = ' <b>H</b> : i';
    }

    // format used for the value to be submitted
    if (options && options.formatSubmit) {
        this.initOptions.formatSubmit = options.formatSubmit;
    }
    else {
        this.initOptions.formatSubmit = 'HHi';
    }

    if (options) {
        // editable input box
        if (options.editable !== undefined) {
            this.initOptions.editable = options.editable;
        }

        // minutes between each value in the list
        if (options.interval !== undefined) {
            this.initOptions.interval = options.interval;
        }

        // time limits
        if (options.min !== undefined) {
            this.initOptions.min = options.min;
        }
        if (options.max !== undefined) {
            this.initOptions.max = options.max;
        }

        // disable times
        if (options.disable !== undefined) {
            this.initOptions.disable = options.disable;
        }

        // close on user actions
        if (options.closeOnSelect !== undefined) {
            // actually ignored (materializeCSS customization to match google datepicker behavior)
            this.initOptions.closeOnSelect = options.closeOnSelect;
        }
        if (options.closeOnClear !== undefined) {
            this.initOptions.closeOnClear = options.closeOnClear;
        }
    }

    let $field = $getFieldId(this, this.data.schema);

    $field.pickatime(this.initOptions);
    this.pickerInstance = $field.pickatime('picker');
    this.isActivated.set(true);
});
