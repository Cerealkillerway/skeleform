// EDITOR
// a textarea with a wysiwyg editor writing html code
// it uses materialNote.js plugin from cerealkiller:materialnote package

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
        ['style', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
        ['fonts', ['fontsize', 'fontname']],
        ['color', ['color']],
        ['undo', ['undo', 'redo', 'help']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['misc', ['link', 'picture', 'table', 'hr', 'codeview', 'fullscreen']],
        ['ckMedia', ['ckImageUploader', 'ckVideoEmbeeder']]
    ],
    ckMultiMedia: [
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['ckMedia', ['ckImageUploader', 'ckVideoEmbeeder']],
    ],
    //special for debug
    debug: [
        ['style', ['style', 'bold', 'italic', 'underline', 'strikethrough', 'clear']],
        ['fonts', ['fontsize', 'fontname']],
        ['color', ['color']],
        ['undo', ['undo', 'redo', 'help']],
        ['ckMedia', ['ckImageUploader', 'ckVideoEmbeeder']],
        ['misc', ['link', 'picture', 'table', 'hr', 'codeview', 'fullscreen']],
        ['para', ['ul', 'ol', 'paragraph', 'leftButton', 'centerButton', 'rightButton', 'justifyButton', 'outdentButton', 'indentButton']],
        ['height', ['lineheight']],
    ]
};


// Helpers
Template.skeleformEditor.helpers(skeleformGeneralHelpers);
Template.skeleformEditor.helpers({
    fieldEditor: function(data, schema) {
        const instance = Template.instance();

        setFieldValue(instance, data, schema);
    }
});


// Events
Template.skeleformEditor.onCreated(function() {
    this.isActivated = new ReactiveVar(false);

    setReplicaIndex(this);
    InvokeCallback(this, null, this.data.schema, 'onCreated');

    //register this on form' store
    this.data.formInstance.Fields.push(this);

    this.getValue = () => {
        return $getFieldId(this, this.data.schema).code().trim();
    };
    this.isValid = () => {
        //SkeleUtils.GlobalUtilities.logger('editor validation', 'skeleformFieldValidation');
        let formInstance = this.data.formInstance;

        return Skeleform.validate.checkOptions(this.getValue(), this.data.schema, formInstance.data.schema, formInstance.data.item);
    };
    this.setValue = (value) => {
        if (value === undefined) {
            value = '';
        }
        $getFieldId(this, this.data.schema).code(value);
    };
});
Template.skeleformEditor.onDestroyed(function() {
    let Fields = this.data.formInstance.Fields;

    Fields.removeAt(Fields.indexOf(this));
});
Template.skeleformEditor.onRendered(function() {
    let editor = this.$('.editor');
    let schema = this.data.schema;
    let toolbar = schema.toolbar;
    let imageParams = this.data.schema.image;

    if ((toolbar === undefined)|| (editorToolbars[toolbar] === undefined)) toolbar = "default";

    $(editor).materialnote({
        lang: SkeleUtils.GlobalUtilities.doubleLangCode(FlowRouter.getParam("itemLang")),
        toolbar: editorToolbars[toolbar],
        height: 400,
        minHeight: 100,
        onInit: () => {
            //place validate class on the correct element newly created by materialnote
            editor.removeClass('validate');
            this.$('.note-editor').addClass('validate');
        },
        onKeyup: (event) => {
            // perform validation and callback invocation on change
            var value = this.getValue();

            this.isValid();
            InvokeCallback(this, value, schema, 'onChange');
        }/*,
        onImageUpload: function(files) {
            var filesArray = [];
            //transform object provided by materialnote into array of files
            filesArray = objectToArray(files);
            filesArray.pop();

            //read as dataUrl
            filesArray.forEach(function(file, index) {
                var reader = new FileReader();

                reader.onloadend = function() {
                    var tempImg = new Image();

                    tempImg.src = reader.result;
                    tempImg.onload = function() {

                        var MAX_WIDTH = imageParams.width;
                        var MAX_HEIGHT = imageParams.height;
                        var tempW = tempImg.width;
                        var tempH = tempImg.height;

                        if (tempW > tempH) {
                            if (tempW > MAX_WIDTH) {
                               tempH *= MAX_WIDTH / tempW;
                               tempW = MAX_WIDTH;
                            }
                        }
                        else {
                            if (tempH > MAX_HEIGHT) {
                               tempW *= MAX_HEIGHT / tempH;
                               tempH = MAX_HEIGHT;
                            }
                        }
                        var canvas = document.createElement('canvas');
                        canvas.width = tempW;
                        canvas.height = tempH;

                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(this, 0, 0, tempW, tempH);

                        var dataUrl = canvas.toDataURL("image/jpeg", imageParams.quality);
                        var imgNode = $('<img />');
                            imgNode.attr('src', dataUrl);
                            imgNode.attr('title', getFileName(file.name));
                        $(editor).materialnote('insertNode', imgNode[0]);
                    };
                };
                reader.readAsDataURL(file);
            });
        }*/
    });

    this.isActivated.set(true);
});
