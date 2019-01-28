import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


skeleformStyleHelpers = {
    formatClasses: function(classes) {
        if (!classes) {
            return '';
        }

        if (Array.isArray(classes)) {
            return classes ? classes.join(' ') : '';
        }

        return classes;
    },
    setId: function(id) {
        if (id !== undefined) {
            return id;
        }
    }
}


//helpers used by form elements
skeleformGeneralHelpers = {
    label: function(name, options) {
        return Skeleform.utils.createLabel(name, options);
    },

    schema: function() {
        return Template.instance().data.fieldSchema.get();
    },

    field: function(name) {
        return Skeleform.utils.createFieldId(Template.instance(), name);
    },

    required: function() {
        let instance = Template.instance();
        let validationOptions = this.fieldSchema.get().validation;

        if (validationOptions && validationOptions.min !== undefined) {
            return ' *';
        }
        return '';
    },

    fieldStyle: function(context) {
        if (context.icon || context.unit) return 'float: left;';
        return '';
    },

    fieldSize: function(size) {
        if (!size) return 's12 m6';
        return size;
    },

    fieldValue: function() {
        // sets the value on the field, used by most field types
        let instance = Template.instance();
        let data = instance.data;
        let formContext = data.formContext;
        let itemToRestore = formContext.item

        // once added/removed a replicaSet, the form will be always in "isRestoring" state since
        // "isRestoring" is never set to false; but if someone else edits the document, all helpers
        // are rerun, and "isRestoring" is initialized again, so here we take the new document's values
        if (data.formContext.isRestoringData === true) {
            itemToRestore = formContext.autoSaves[formContext.autoSaves.length - 1];
        }

        Skeleform.utils.setFieldValue(instance, itemToRestore, data.fieldSchema.get(), data.formContext);
    },

    formatClasses: skeleformStyleHelpers.formatClasses,

    instance: function() {
        return Template.instance();
    }
};


toolbarsHelpers = {
    makeUndoPath: function(path) {
        let params = Skeleform.utils.createPath(path);
        return FlowRouter.path(path[0], params.params, {lang: Skeletor.Skelelang.i18n.currentLocale.get()});
    }
};
