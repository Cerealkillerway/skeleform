// CLOCK PICKER
// an input field with clock plugin
// it uses materialize's version of clockpicker plugin for more informations: https://github.com/chingyawhao/materialize-clockpicker
// original clockpicker documentation: https://github.com/weareoutman/clockpicker

Template.skeleformClockPicker.helpers(skeleformGeneralHelpers);
Template.skeleformClockPicker.helpers({
    fieldClock: function(data, schema) {
        const instance = Template.instance();

        setFieldValue(instance, data, schema);
    }
});

Template.skeleformClockPicker.onCreated(function() {
    this.isActivated = new ReactiveVar(false);
    this.initOptions = {};

    //register this on form' store
    this.data.formInstance.Fields.push(this);

    this.i18n = (currentLang) => {
        let $element = $getFieldId(this, this.data.schema);

        this.initOptions.donetext = TAPi18n.__('pickadateButtons_labels').split(' ')[2];
        $element.clockpicker('remove');
        $element.clockpicker(this.initOptions);
    };
    this.getValue = () => {
        return moment($getFieldId(this, this.data.schema).val(), this.initOptions.format).format(this.initOptions.formatSubmit);
    };
    this.isValid = () => {
        //skeleUtils.globalUtilities.logger('clockpicker validation', 'skeleformFieldValidation');
        let formInstance = this.data.formInstance;

        return Skeleform.validate.checkOptions(this.getValue(), this.data.schema, formInstance.data.schema, formInstance.data.item);
    };
    this.setValue = (value) => {
        let initOptions = this.initOptions;

        // avoid empty strings since in that case moment will use current datetime as input;
        if (value === undefined || value.length === 0) return;

        value = moment(value, initOptions.formatSubmit).format(initOptions.format);
        $getFieldId(this, this.data.schema).val(value);
    };
});

Template.skeleformClockPicker.onRendered(function() {
    let data = this.data.item;
    let schema = this.data.schema;
    let options = schema.pickerOptions;

    // activates validation on set
    this.initOptions = {
        afterDone: () => {
            // perform validation and callback invocation on change
            let value = this.getValue();

            this.isValid();
            InvokeCallback(this, value, schema, 'onChange');
        }
    };

    // format used to display
    if (options && options.format) {
        this.initOptions.format = options.format;
    }
    else {
        this.initOptions.format = 'H:mm';
    }

    // format used for the value to be submitted
    if (options && options.formatSubmit) {
        this.initOptions.formatSubmit = options.formatSubmit;
    }
    else {
        this.initOptions.formatSubmit = 'HHmm';
    }

    // default time
    if (options && options.default) {
        this.initOptions.default = options.default;
    }
    else {
        this.initOptions.default = 'now';
    }

    // 12/24 hours
    if (options && options.twelvehour) {
        this.initOptions.twelvehour = options.twelvehour;
    }
    else {
        this.initOptions.twelvehour = false;
    }

    // autoclose
    if (options && options.autoclose) {
        this.initOptions.autoclose = options.autoclose;
    }
    else {
        this.initOptions.autoclose = true;
    }

    if (options) {
        // am/pm button clickable
        if (options.ampmclickable !== undefined) {
            this.initOptions.ampmclickable = options.ampmclickable;
        }

        // vibration on mobile devices while dragging
        if (options.vibrate !== undefined) {
            this.initOptions.vibrate = options.vibrate;
        }

        // popover placement
        if (options.placement !== undefined) {
            this.initOptions.placement = options.placement;
        }

        // popover arrow align
        if (options.align !== undefined) {
            this.initOptions.align = options.align;
        }

        // set default time to * milliseconds from now (using with default = 'now')
        if (options.fromnow !== undefined) {
            this.initOptions.fromnow = options.fromnow;
        }
    }

    $getFieldId(this, this.data.schema).clockpicker(this.initOptions);
    this.isActivated.set(true);
});
