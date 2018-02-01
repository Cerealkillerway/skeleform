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
        name = name.split('.');

        for (i = 1; i < name.length; i++) {
            name[i] = name[i].capitalize();
        }
        name = name.join('');

        switch(options) {
            case 'shadowConfirm':
            return TAPi18n.__(name + 'ShadowConfirm_lbl');

            case 'title':
            return TAPi18n.__(name + '_title');

            case 'text':
            return TAPi18n.__(name + '_text');

            default:
            return TAPi18n.__(name + '_lbl');
        }
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

        /*if (instance.data.schema.output === 'input') {
            instance.forcedReloads.get();
        }*/
        if ((validationOptions && validationOptions.min !== undefined) || validationOptions && validationOptions.type === 'date') return ' *';
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

        Skeleform.utils.setFieldValue(instance, data.formContext.item, data.fieldSchema.get());
    },

    formatClasses: skeleformStyleHelpers.formatClasses
};


toolbarsHelpers = {
    makeUndoPath: function(path) {
        let params = Skeleform.utils.createPath(path);
        return FlowRouter.path(path[0], params.params, {lang: TAPi18n.getLanguage()});
    }
};
