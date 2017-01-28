// Skeleform helpers
Template.skeleform.helpers({
    toolbarContext: function() {
        return {
            Fields: Template.instance().Fields,
            formContext: Template.instance().data
        };
    },
    generalContext: function() {
        let data = Template.instance().data;

        data.formInstance = Template.instance();
        return data;
    }
});


// skeleform body helpers
Template.skeleformBody.helpers({
    isFieldInCurrentForm: function(fieldSchema) {
        const instance = Template.instance();
        let formData = instance.data.item;
        let data;

        // skip fields that have not to be displayed in form
        if (fieldSchema.output === 'none') {
            return false;
        }

        switch (fieldSchema.showOnly) {
            case 'create':
            if (formData) {
                return false;
            }
            break;

            case 'update':
            if (!formData) {
                return false;
            }
            break;
        }

        data = {
            formInstance: Template.instance().data.formInstance,
            schema: fieldSchema,
            item: formData,
            groupLevel: instance.data.groupLevel || 0
        };

        // data.groupLevel will contain the level of group nesting of the field
        if (fieldSchema.skeleformGroup) {
            data.groupLevel = data.groupLevel + 1;
        }

        return {
            template: fieldSchema.output ? 'skeleform' + fieldSchema.output.capitalize() : null,
            data: data
        };
    }
});


// update buttons (toolbar)
Template.skeleformUpdateButtons.helpers({
    isTranslatable: function() {
        if (FlowRouter.getParam('itemLang')) {
            return true;
        }
        return false;
    }
});


// Toolbars
Template.skeleformCreateButtons.helpers(toolbarsHelpers);
Template.skeleformUpdateButtons.helpers(toolbarsHelpers);


// SkeleformLangBar
Template.skeleformLangBar.helpers({
    langs: function() {
        let result = [];

        if (Skeletor.GlobalConf) {
            _.each(Skeletor.GlobalConf.langEnable, function(value, key) {
                if (value) {
                    result.push(key);
                }
            });

            return result;
        }
    },
    isActive: function(buttonLang) {
        if (FlowRouter.getParam('itemLang') === buttonLang) {
            return 'active';
        }
    }
});
