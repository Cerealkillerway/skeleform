// STATIC TITLE
// it just displays a static string

Template.skeleformStaticTitle.helpers(skeleformGeneralHelpers);
Template.skeleformStaticTitle.helpers({
    createTitle: function(schema) {
        let instance = Template.instance();
        let content;
        let tag = schema.tag;
        let classes = schema.classes;

        if (schema.content !== undefined) {
            content = schema.content(instance);
        }
        else {
            content = Skeleform.utils.createLabel(schema.name, schema.labelType);
        }

        if (!tag) {
            tag = 'h3';
        }
        let title = '<' + tag;

        if (classes) {
            title = title + ' class="' + classes.join(', ') + '"';
        }

        title = title + '>' + content + '</' + tag +'>';
        return title;
    }
});

Template.skeleformStaticTitle.onCreated(function() {
    this.isActivated = new ReactiveVar(true);
});

Template.skeleformStaticTitle.onCreated(function() {
    Skeleform.utils.registerField(this);
});
