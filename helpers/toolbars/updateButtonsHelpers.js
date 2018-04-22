import '../commonHelpers.js';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


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
