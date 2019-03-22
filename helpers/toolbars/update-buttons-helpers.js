import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


// update buttons (toolbar)
Template.skeleformUpdateButtons.helpers(Skeletor.SkeleUtils.GlobalHelpers.toolbarsHelpers);
Template.skeleformUpdateButtons.helpers({
    isTranslatable: function() {
        if (FlowRouter.getParam('itemLang')) {
            return true;
        }
        return false;
    }
});
