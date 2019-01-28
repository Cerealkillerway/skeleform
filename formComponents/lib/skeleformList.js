import Sortable from 'sortablejs';


let displayValue = function(displaySchema, sourceData) {
    let instance = Template.instance();
    let name = displaySchema.name;
    let value;

    //console.log(instance.subscriptionsReady.get());
    if (!instance.subscriptionsReady.get()) {
        return false;
    }

    if (displaySchema.value !== undefined) {
        return displaySchema.value;
    }

    let formSchema = instance.data.formContext.schema;
    let fields;

    if (displaySchema.schema) {
        fields = Skeletor.Schemas[displaySchema.schema].fields;
    }
    else {
        fields = formSchema.fields;
    }

    let fieldSchema = SkeleUtils.GlobalUtilities.fieldSchemaLookup(fields, name);

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
}


Template.skeleformList.helpers(skeleformGeneralHelpers);
Template.skeleformList.helpers({
    displayValues: function(fieldSchema) {
        return fieldSchema.displayValues(Template.instance());
    },

    displayValue: function(displaySchema, sourceData) {
        return displayValue(displaySchema, sourceData)
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
    },

    items: function() {
        let instance = Template.instance();

        return instance.items.get();
    },

    valueSchema: function(sourceData) {
        let instance = Template.instance();
        let fieldSchema = instance.data.fieldSchema.get();

        if (_.isFunction(fieldSchema.value)) {
            return fieldSchema.value(instance, sourceData);
        }
        else {
            return displayValue(fieldSchema.value, sourceData);
        }
    },

    isEmpty: function() {
        let instance = Template.instance();
        let items = instance.items.get();

        if (Match.test(items, Mongo.Cursor)) {
            items = items.fetch();
        }

        if (!items || items.length === 0) {
            return true;
        }
        return false;
    }
});


Template.skeleformList.onCreated(function() {
    Skeleform.utils.registerField(this);
    this.isActivated = new ReactiveVar(false);
    this.sortablePluginActive = new ReactiveVar(false);
    this.subscriptionsReady = new ReactiveVar(false);
    this.sourceSet = new ReactiveVar(false);

    let fieldSchema = this.data.fieldSchema.get();

    // no external subscription needed
    if (fieldSchema.subscription === undefined) {
        this.sourceSet.set(true);
    }

    Skeleform.utils.InvokeCallback(this, null, fieldSchema, 'onCreated');

    this.items = new ReactiveVar([]);

    if (fieldSchema.subscription) {
        let subscription = fieldSchema.subscription(this);

        this.subscriptionsReady.set(subscription);
    }
    else {
        this.subscriptionsReady.set(true);
    }

    Meteor.setTimeout(() => {
        this.subscriptionsReady.set(true);
    }, 5000);

    this.autorun(() => {
        let ready = this.subscriptionsReady.get();
        console.log(ready);
    })

    this.autorun(() => {
        if (!this.data.formContext.skeleSubsReady.get()) {
            return false;
        }

        this.items.set(fieldSchema.source(this));
        this.sourceSet.set(true);
    });

    this.autorun(() => {
        if (this.sortablePluginActive.get() === true && this.sourceSet.get() === true) {
            this.isActivated.set(true);
        }
    });

    this.getValue = () => {
        return this.sortable.toArray();
    };

    this.isValid = () => {
        let formContext = this.data.formContext;

        return Skeleform.validate.checkOptions(this.getValue(), fieldSchema, formContext.schema, formContext.item);
    };

    this.setValue = (value) => {
        Tracker.afterFlush(() => {
            if (value) {
                let currentValue = this.getValue();
                let difference = _.difference(currentValue, value);

                value = [...value, ...difference];

                if (value.length > 0) {
                    this.sortable.sort(value);
                }
            }
        });
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

    Meteor.setTimeout(() => {
        this.sortable = Sortable.create(items, sortableOptions);
        this.sortablePluginActive.set(true);
    }, 1000);

    Skeleform.utils.InvokeCallback(this, null, fieldSchema, 'onRendered');
});
