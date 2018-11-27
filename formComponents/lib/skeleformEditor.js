import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


// EDITOR
// a textarea with a wysiwyg editor writing html code


// Helpers
Template.skeleformEditor.helpers(skeleformGeneralHelpers);


// Events
Template.skeleformEditor.onCreated(function() {
    Skeleform.utils.registerField(this);
    this.isActivated = new ReactiveVar(false);

    let schema = this.data.fieldSchema.get();

    Skeleform.utils.InvokeCallback(this, null, schema, 'onCreated');


    this.getValue = () => {
        let $field = Skeleform.utils.$getFieldById(this, schema);

        return $field.html();
    };

    this.isValid = () => {
        //SkeleUtils.GlobalUtilities.logger('editor validation', 'skeleformFieldValidation');
        let formContext = this.data.formContext;

        return Skeleform.validate.checkOptions(this.getValue(), schema, formContext.schema, formContext.item);
    };

    this.setValue = (value) => {
        let $field = Skeleform.utils.$getFieldById(this, schema);

        $field.html(value);

        Skeleform.utils.InvokeCallback(this, value, schema, 'onChange');
    };
});


Template.skeleformEditor.onDestroyed(function() {
    let fields = this.data.formContext.fields;

    fields.removeAt(fields.indexOf(this));
});


Template.skeleformEditor.onRendered(function() {
    let instance = this;
    let schema = instance.data.fieldSchema.get();
    let staticOffset;

    // handle staticOffset
    if (schema.staticOffset) {
        staticOffset = schema.staticOffset + 'px';
    }
    else {
        // if offset is not specified on the schema check if skeleform' static bar is present
        if ($('.skeleStaticBar').length > 0) {
            staticOffset = '60px';
        }
    }
    if (staticOffset) {
        instance.$('.skeleEditorToolbarWrapper').css({top: staticOffset});
    }

    // handle height and minHeight
    if (schema.height) {
        instance.$('.skeleEditor').css({height: schema.height + 'px'});
    }
    if (schema.minHeight) {
        instance.$('.skeleEditor').css({minHeight: schema.minHeight + 'px'});
    }

    Tracker.afterFlush(() => {
        if (this.data.formContext.skeleSubsReady.get()) {
            if (this.$('.skeleEditor').children().length = 0) {
                SkeleUtils.GlobalUtilities.logger('cannot find content in current editor', 'skelePlugin');
                return false;
            }

            // auto adjust background color;
            let $editor = this.$('.skeleEditor');
            let editorBackground = $editor.css('backgroundColor');
            let contentColor = $editor.children().first().css('color');
            let delta;

            editorBackground = SkeleUtils.GlobalUtilities.colorConversion(editorBackground, 'rgb', 'rgb');
            contentColor = SkeleUtils.GlobalUtilities.colorConversion(contentColor, 'rgb', 'rgb');
            delta = SkeleUtils.GlobalUtilities.colorDifference(editorBackground, contentColor);

            if (delta < 20) {
                $editor.addClass('altColor');
            }
        }
    });

    // initialize selects
    this.$('select').material_select();

    this.isActivated.set(true);
    Skeleform.utils.InvokeCallback(this, null, schema, 'onRendered');
});


Template.skeleformEditor.events({
    // handle button commands execution
    'mousedown .skeleEditorIcon': function(event, template) {
        event.preventDefault();
        let $target = $(event.target);
        let $btn = $target.parent('.skeleEditorBtn');
        let command;

        command = $btn.data('command');
        $btn.addClass('active');

        switch (command) {
            case 'editorBackground':
                template.$('.skeleEditor').toggleClass('altColor');
                break;


            default:
                document.execCommand(command, false, '');
        }
    },


    'mousedown .select-wrapper li': function(event, template) {
        document.execCommand('formatblock', false, 'span')

        let listId = window.getSelection().focusNode.parentNode;
        $(listId).addClass("fontSize");
    },



    // handle button descriptions
    'mouseenter .skeleEditorIcon': function(event, template) {
        let label = $(event.target).parent('.skeleEditorBtn').data('label') + '_lbl'
        let $commandDescription = template.$('.skeleEditorToolbarDescription');

        label = Skeletor.Skelelang.i18n.get(label);

        $commandDescription.html(label);
        $commandDescription.stop(true, false).animate({opacity: 1}, 300);
    },


    'mouseleave .skeleEditorIcon': function(event, template) {
        let $commandDescription = template.$('.skeleEditorToolbarDescription');

        $commandDescription.stop(true, false).animate({opacity: 0}, 300, function() {
            $commandDescription.html('');
        });
    },


    // handle buttons highlightning
    'keyup/click .skeleEditor': function(event, template) {
        let sel;
        let containerNode;
        let end = false;

        template.$('.skeleEditorBtn').removeClass('active');

        if (window.getSelection) {
            sel = window.getSelection();

            if (sel.rangeCount > 0) {
                containerNode = sel.getRangeAt(0).commonAncestorContainer;
            }
        }
        else if ((sel = document.selection) && sel.type != "Control" ) {
            containerNode = sel.createRange().parentElement();
        }

        while (containerNode && !end) {
            if (containerNode.nodeType == 1) {
                if (containerNode.className.indexOf('skeleEditor') >= 0) {
                    end = true;
                }
                else {
                    switch (containerNode.tagName) {
                        case 'B':
                            template.$('.skeleEditorBold').addClass('active');
                            break;

                        case 'U':
                            template.$('.skeleEditorUnderline').addClass('active');
                            break;

                        case 'I':
                            template.$('.skeleEditorItalic').addClass('active');
                            break;
                    }
                }
            }
            containerNode = containerNode.parentNode;
        }
    },


    'blur .skeleEditor': function(event, template) {
        template.$('skeleEditorBtn').removeClass('active');
    }
})
