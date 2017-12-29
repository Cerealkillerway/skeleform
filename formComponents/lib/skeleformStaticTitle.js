// STATIC TITLE
// it just displays a static string

Template.skeleformStaticTitle.helpers(skeleformGeneralHelpers);
Template.skeleformStaticTitle.helpers({
    createTitle: function(string, tag, classes) {
        if (!tag) {
            tag = 'h3';
        }
        let title = '<' + tag;

        if (classes) {
            title = title + ' class="' + classes.join(', ') + '"';
        }

        title = title + '>' + string + '</' + tag +'>';
        return title;
    }
});

Template.skeleformStaticTitle.onCreated(function() {
    this.isActivated = new ReactiveVar(true);
    setReplicaIndex(this);
});
