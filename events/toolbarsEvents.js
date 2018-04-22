import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let configuration = Skeletor.configuration;


// skeleform language bar
Template.skeleformLangBar.events({
    'click .langFlag': function(event, template) {
        let newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});


// skeletor static addons
Template.skeleformStaticAddons.events({
    'click .toTop': function(event, template) {
        SkeleUtils.GlobalUtilities.scrollTo(0, configuration.animations.scrollTop);
    },
    'click .toBottom': function(event, template) {
        // if there are no errors in the form -> scroll to page's bottom
        if ($('.invalid').length === 0) {
            SkeleUtils.GlobalUtilities.scrollTo($('body').height(), configuration.animations.scrollBottom);
        }
        // otherwise scroll to first error
        else {
            let offsetCorrection = 80;

            if ($('.staticTop').length === 0) {
                offsetCorrection = offsetCorrection + 66;
            }

            SkeleUtils.GlobalUtilities.scrollTo($('.invalid').first().offset().top - offsetCorrection, configuration.animations.scrollBottom);
        }
    }
});
