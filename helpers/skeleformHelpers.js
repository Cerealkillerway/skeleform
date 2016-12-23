// Skeleform helpers
Template.skeleform.helpers({
    isFieldInCurrentForm: function(fieldSchema) {
        var formData = Template.instance().data.item;

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

        return {
            template: "skeleform" + fieldSchema.output.capitalize(),
            data: {
                formInstance: Template.instance(),
                schema: fieldSchema,
                item: formData,
            }
        };
    },
    toolbarContext: function() {
        return {
            Fields: Template.instance().Fields,
            formContext: Template.instance().data
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
        var result = [];

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
