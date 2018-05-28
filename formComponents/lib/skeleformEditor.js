import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


// EDITOR
// a textarea with a wysiwyg editor writing html code

// Settings
editorToolbars = {
    default: [
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['fonts', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['misc', ['link', 'picture', 'codeview', 'fullscreen']]
    ],
    minimal: [
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['color', ['color']]
    ],
    full: [
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['font', ['fontname', 'color', 'strikethrough', 'superscript', 'subscript']],
        ['fontsize', ['fontsize']],
        ['para', ['ul', 'ol', 'paragraph', 'paragraphAlignLeft', 'paragraphAlignRight', 'paragraphAlignCenter', 'paragraphAlignFull', 'paragraphOutdent', 'paragraphIndent']],
        ['height', ['height']],
        ['materialize', ['materializeCard']],
        ['insert', ['picture', 'link', 'video', 'table', 'hr']],
        ['misc', ['fullscreen', 'codeview', 'undo', 'redo', 'help']]
    ],
    //special for debug
    debug: [
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['font', ['fontname', 'color', 'strikethrough', 'superscript', 'subscript']],
        ['fontsize', ['fontsize']],
        ['para', ['ul', 'ol', 'paragraph', 'paragraphAlignLeft', 'paragraphAlignRight', 'paragraphAlignCenter', 'paragraphAlignFull', 'paragraphOutdent', 'paragraphIndent']],
        ['height', ['height']],
        ['materialize', ['materializeCard']],
        ['insert', ['picture', 'link', 'video', 'table', 'hr']],
        ['misc', ['fullscreen', 'codeview', 'undo', 'redo', 'help']]
    ]
};


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
    let schema = this.data.fieldSchema.get();

    this.isActivated.set(true);
    Skeleform.utils.InvokeCallback(this, null, schema, 'onRendered');
});


Template.skeleformEditor.events({
    'mousedown .skeleEditorBtn': function(event, template) {
        event.preventDefault();
    },

    'click .skeleEditorBtn': function(event, template) {
        document.execCommand($(event.target).data('command'), false, '');
    }
})
