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

    // now commented because very slow...
    /*this.i18n = () => {
        if (FlowRouter.getQueryParam('lang') === this.currentLang) {
            return;
        }

        this.currentLang = FlowRouter.getQueryParam('lang');
        let editor = this.$('.editor');

        this.options.lang = SkeleUtils.GlobalUtilities.doubleLangCode(FlowRouter.getQueryParam('lang'));

        $(editor).materialnote('destroy');
        $(editor).materialnote(this.options);
    };*/

    this.getValue = () => {
        return Skeleform.utils.$getFieldById(this, schema).materialnote('code').trim();
    };

    this.isValid = () => {
        //SkeleUtils.GlobalUtilities.logger('editor validation', 'skeleformFieldValidation');
        let formContext = this.data.formContext;

        return Skeleform.validate.checkOptions(this.getValue(), schema, formContext.schema, formContext.item);
    };

    this.setValue = (value) => {
        if (value === undefined) {
            value = '';
        }
        Skeleform.utils.$getFieldById(this, schema).materialnote('code', value);

        Skeleform.utils.InvokeCallback(this, value, schema, 'onChange');
    };
});


Template.skeleformEditor.onDestroyed(function() {
    let fields = this.data.formContext.fields;

    fields.removeAt(fields.indexOf(this));
});


Template.skeleformEditor.onRendered(function() {
    let editor = this.$('.editor');
    let schema = this.data.fieldSchema.get();
    let toolbar = schema.toolbar;
    let imageParams = schema.image;
    this.currentLang = FlowRouter.getQueryParam('lang');

    if ((toolbar === undefined)|| (editorToolbars[toolbar] === undefined)) toolbar = 'default';

    this.options = {
        lang: SkeleUtils.GlobalUtilities.doubleLangCode(this.currentLang),
        toolbar: editorToolbars[toolbar],
        followingToolbar: true,
        otherStaticBarClass: 'skeleStaticBar',
        height: schema.editorHeight || 400,
        minHeight: schema.editorMinHeight || 100,
        posIndex: schema.name,
        callbacks: {
            onInit: () => {
                //place validate class on the correct element newly created by materialnote
                editor.removeClass('validate');
                this.$('.note-editor').addClass('validate');
            },
            onKeyup: (event) => {
                // perform validation and callback invocation on change
                let value = this.getValue();
                let result = this.isValid();
                let id = schema.name;

                if (!result.valid) {
                    Skeleform.validate.setInvalid(id, schema, result);
                }
                else {
                    Skeleform.validate.skeleformSuccessStatus(id, schema);
                }

                Skeleform.utils.InvokeCallback(this, value, schema, 'onChange', true);
            }
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
    }

    $(editor).materialnote(this.options);

    this.isActivated.set(true);
    Skeleform.utils.InvokeCallback(this, null, schema, 'onRendered');
});
