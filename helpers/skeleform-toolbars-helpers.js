import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


// SkeleformLangBar
Template.skeleformLangBar.helpers({
    langs: function() {
        let result = [];

        if (Skeletor.configuration) {
            _.each(Skeletor.configuration.langEnable, function(value, key) {
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
