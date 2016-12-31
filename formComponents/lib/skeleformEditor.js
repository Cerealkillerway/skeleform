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
        var template = Template.instance();

        setFieldValue(template, data, schema);
    }
});


// Events
Template.skeleformEditor.onCreated(function() {
    var self = this;
    self.isActivated = new ReactiveVar(false);

    //register self on form' store
    self.data.formInstance.Fields.push(self);

    self.getValue = function() {
        return $getFieldId(self, self.data.schema).code().trim();
    };
    self.isValid = function() {
        //skeleUtils.globalUtilities.logger('editor validation', 'skeleformFieldValidation');
        var formInstance = self.data.formInstance;

        return Skeleform.validate.checkOptions(self.getValue(), self.data.schema, formInstance.data.schema, formInstance.data.item);
    };
    self.setValue = function(value) {
        if (value === undefined) {
            value = '';
        }
        $getFieldId(self, self.data.schema).code(value);
    };
});
Template.skeleformEditor.onRendered(function() {
    var self = this;
    var editor = self.$('.editor');
    var schema = self.data.schema;
    var toolbar = schema.toolbar;
    var imageParams = self.data.schema.image;

    if ((toolbar === undefined)|| (editorToolbars[toolbar] === undefined)) toolbar = "default";

    $(editor).materialnote({
        lang: skeleUtils.globalUtilities.doubleLangCode(FlowRouter.getParam("itemLang")),
        toolbar: editorToolbars[toolbar],
        height: 400,
        minHeight: 100,
        onInit: function() {
            //place validate class on the correct element newly created by materialnote
            editor.removeClass('validate');
            self.$('.note-editor').addClass('validate');
        },
        onKeyup: function(event) {
            console.log('keyup');
            // perform validation and callback invocation on change
            var value = self.getValue();

            self.isValid();
            InvokeCallback(self, value, schema, 'onChange');
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

    self.isActivated.set(true);
});
