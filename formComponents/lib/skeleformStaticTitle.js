// STATIC TITLE
// it just displays a static string

Template.skeleformStaticTitle.helpers(skeleformGeneralHelpers);
Template.skeleformStaticTitle.helpers({
    createTitle: function(fieldSchema) {
        let instance = Template.instance();
        let content;
        let tag = fieldSchema.tag;
        let classes = fieldSchema.classes;

        if (!instance.subscriptionsReady.get()) {
            return;
        }

        function createTag(string) {
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

        if (fieldSchema.subscription && instance.data.formContext.skeleSubsReady.get() === true) {
            content = fieldSchema.content(instance);
            return createTag(content);
        }
        else {
            if (fieldSchema.content !== undefined) {
                content = fieldSchema.content(instance);
                return createTag(instance);
            }
            else {
                content = Skeleform.utils.createLabel(fieldSchema.name, fieldSchema.labelType);
                return createTag(content);
            }
        }



    }
});

Template.skeleformStaticTitle.onCreated(function() {
    this.isActivated = new ReactiveVar(true);
    this.subscriptionsReady = new ReactiveVar(false);
    let fieldSchema = this.data.fieldSchema.get();

    this.autorun(() => {
        if (fieldSchema.subscription) {
            this.subscriptionsReady.set(fieldSchema.subscription(this));
        }
        else {
            this.subscriptionsReady.set(true);
        }
    });
});

Template.skeleformStaticTitle.onCreated(function() {
    Skeleform.utils.registerField(this);
});
