import Sortable from 'sortablejs';


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

    displayValue: function(displaySchema, sourceData) {
        let instance = Template.instance();
        let name = displaySchema.name;
        let value;

        if (displaySchema.i18n === false) {
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

        return value;
    },

    fieldSchema: function() {
        return Template.instance().data.fieldSchema.get();
    },

    dragHandleIcon: function() {
        let fieldSchema = Template.instance().data.fieldSchema.get();

        return fieldSchema.dragHandleIcon || 'drag_handle'
    }
});


Template.skeleformList.onCreated(function() {
    Skeleform.utils.registerField(this);
    this.isActivated = new ReactiveVar(false);

    let schema = this.data.fieldSchema.get();

    Skeleform.utils.InvokeCallback(this, null, schema, 'onCreated');

    this.getValue = () => {

    };

    this.isValid = () => {

    };

    this.setValue = () => {

    };
});


Template.skeleformList.onDestroyed(function() {
    let fields = this.data.formContext.fields;

    fields.removeAt(fields.indexOf(this));
});


Template.skeleformList.onRendered(function() {
    let schema = this.data.fieldSchema.get();
    let items = this.$('.skeleformListItems')[0];
    let sortableOptions = {
        animation: 150,
        handle: '.dragHandle',
    }


    let sortable = Sortable.create(items, sortableOptions);

    this.isActivated.set(true);
    Skeleform.utils.InvokeCallback(this, null, schema, 'onRendered');
});
