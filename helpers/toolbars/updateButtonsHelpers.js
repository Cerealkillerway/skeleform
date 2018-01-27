import '../commonHelpers.js';


// update buttons (toolbar)
Template.skeleformUpdateButtons.helpers(toolbarsHelpers);
Template.skeleformUpdateButtons.helpers({
    isTranslatable: function() {
        if (FlowRouter.getParam('itemLang')) {
            return true;
        }
        return false;
    }
});
