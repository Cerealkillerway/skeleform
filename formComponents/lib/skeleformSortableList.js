Template.skeleformSortableList.helpers({
    data: function() {
        let instance = Template.instance();
        let fieldSchema = instance.data.fieldSchema.get();

        return fieldSchema.source(instance);
    }
});


Template.skeleformSortableList.onCreated(function() {
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


Template.skeleformSortableList.onDestroyed(function() {
    let fields = this.data.formContext.fields;

    fields.removeAt(fields.indexOf(this));
});


Template.skeleformSortableList.onRendered(function() {
    let schema = this.data.fieldSchema.get();

    this.isActivated.set(true);
    Skeleform.utils.InvokeCallback(this, null, schema, 'onRendered');
});
