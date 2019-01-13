import Sortable from 'sortablejs';


Template.skeleformList.helpers(skeleformGeneralHelpers);
Template.skeleformList.helpers({
    data: function() {
        let instance = Template.instance();
        let fieldSchema = instance.data.fieldSchema.get();

        if (fieldSchema.subscription) {
            instance.data.formContext.skeleSubsReady.set(instance.data.formContext.skeleSubsReady && fieldSchema.subscription(instance));
        }

        if (!instance.data.formContext.skeleSubsReady.get()) {
            return false;
        }

        return fieldSchema.source(instance);
    },

    displayValues: function(fieldSchema) {
        return fieldSchema.displayValues(Template.instance());
    },

    displayValue: function(displaySchema, sourceData) {
        let instance = Template.instance();
        let name = displaySchema.name;
        let value;

        if (displaySchema.value !== undefined) {
            return displaySchema.value;
        }

        let formSchema = instance.data.formContext.schema;
        let fieldSchema = SkeleUtils.GlobalUtilities.fieldSchemaLookup(formSchema.fields, sourceData.name);

        if (!fieldSchema || fieldSchema.i18n === false) {
            value = sourceData[name];
        }
        else {
            let currentLang = Skeletor.FlowRouter.getParam('itemLang');

            value = sourceData[`${currentLang}---${name}`];
        }

        if (value === '') {
            if (displaySchema.isIcon) {
                value = 'battery_unknown';
            }
            else {
                value = Skeletor.Skelelang.i18n.get('undefined_lbl')
            }
        }

        if (displaySchema.transform !== undefined) {
            value = displaySchema.transform(value, instance);
        }

        return value;
    },

    fieldSchema: function() {
        return Template.instance().data.fieldSchema.get();
    },

    dragHandleIcon: function() {
        let fieldSchema = Template.instance().data.fieldSchema.get();

        return fieldSchema.dragHandleIcon || 'drag_handle'
    },

    skeleClasses: function() {
        let instance = Template.instance();
        let fieldSchema = instance.data.fieldSchema.get();

        if (fieldSchema.readOnly === true) {
            return '';
        }

        return 'skeleValidate skeleGather';
    }
});


Template.skeleformList.onCreated(function() {
    Skeleform.utils.registerField(this);
    this.isActivated = new ReactiveVar(false);

    let schema = this.data.fieldSchema.get();

    Skeleform.utils.InvokeCallback(this, null, schema, 'onCreated');

    this.getValue = () => {
        console.log(this.sortable.toArray());
        return ['chJMicjSgHSTDAe2h'];
    };

    this.isValid = () => {
        let formContext = this.data.formContext;

        return Skeleform.validate.checkOptions(this.getValue(), schema, formContext.schema, formContext.item);
    };

    this.setValue = (value) => {
        console.log('setvalue');
        console.log(value);
    };
});


Template.skeleformList.onDestroyed(function() {
    let fields = this.data.formContext.fields;

    fields.removeAt(fields.indexOf(this));
});


Template.skeleformList.onRendered(function() {
    let fieldSchema = this.data.fieldSchema.get();
    let items = this.$('.skeleformListItems')[0];
    let sortableOptions;
    let defaultOptions = {
        animation: 150,
        handle: '.dragHandle'
    }

    sortableOptions = {...defaultOptions, ...fieldSchema.sortableOptions};

    this.sortable = Sortable.create(items, sortableOptions);

    this.isActivated.set(true);
    Skeleform.utils.InvokeCallback(this, null, fieldSchema, 'onRendered');
});
