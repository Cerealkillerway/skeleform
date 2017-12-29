// EDITOR
// a textarea with a wysiwyg editor writing html code
// it uses materialNote.js plugin from cerealkiller:materialnote package
let defaults = {
    thumbnail: {
        width: 200,
        height: 200
    },
    image: {
        width: 1000,
        height: 1000
    }
}


// Helpers
Template.skeleformImageUpload.helpers(skeleformGeneralHelpers);
Template.skeleformImageUpload.helpers({
    placeholder: function(name) {
        if (!name) {
            return;
        }

        name = name.split('.');

        for (i = 1; i < name.length; i++) {
            name[i] = name[i].capitalize();
        }
        name = name.join('');

        return TAPi18n.__(name + '_lbl');
    },

    isMultiple: function(schema) {
        if (schema.multiple) {
            return 'multiple';
        }
        return '';
    },

    photoClasses: function(schema) {
        let classes = schema.iconClasses;

        // if is an array, join it
        if (Array.isArray(classes)) {
            return classes.join(' ');
        }

        if (classes === undefined) {
            // set default to 'left'
            if (schema.icon) {
                return 'left';
            }

            return '';
        }

        // if is a string
        return classes;
    },

    filePathClass: function(schema) {
        if (schema.filePath === false) {
            return 'skeleformInvisible'
        }
        return '';
    }
});


// Events
Template.skeleformImageUpload.onCreated(function() {
    this.isActivated = new ReactiveVar(false);

    let schema = this.data.schema.get();

    setReplicaIndex(this);
    InvokeCallback(this, null, schema, 'onCreated');

    //register this on form' store
    this.data.formInstance.Fields.push(this);
    this.isSettingValue = false;

    this.getValue = () => {
        let $canvasContainer = this.$('.skeleCanvasContainer');
        let images = [];
        let imageQuality = 1;

        if (schema.image) {
            imageQuality = schema.image.quality;
        }

        $.each($canvasContainer.find('.skeleMainCanvas'), function(index, canvas) {
            let dataURL = canvas.toDataURL('image/jpeg', imageQuality);

            images.push({
                image: dataURL
            });
        });

        return images;
    };
    this.isValid = () => {
        let formInstance = this.data.formInstance;

        return Skeleform.validate.checkOptions(this.getValue(), schema, formInstance.data.schema, formInstance.data.item, this);
    };
    this.setValue = (value) => {
        if (!value || this.isSettingValue) {
            return false;
        }

        // isSettingValue is used to avoid creating double canvas (this can happen due to async image loading into tempImg object
        // in the following code...)
        this.isSettingValue = true;

        let $canvasContainer = this.$('.skeleCanvasContainer');
        let thumbnailWidth = defaults.thumbnail.width;
        let thumbnailHeight = defaults.thumbnail.height;

        $canvasContainer.empty();

        if (schema.thumbnail) {
            thumbnailWidth = schema.thumbnail.width || defaults.thumbnail.width;
            thumbnailHeight = schema.thumbnail.height || defaults.thumbnail.height;
        }

        for (imageObject of value) {
            // create image object and load image's data url into it
            let tempImg = new Image;

            tempImg.onload = function() {
                let tempW = tempImg.width;
                let tempH = tempImg.height;

                // create thumbnail canvas
                SkeleUtils.GlobalUtilities.logger('creating image thumb canvas for loaded image...', 'skeleformField');
                let thumbCanvas = $('<canvas/>', {class: 'skeleThumbCanvas'})[0];

                $canvasContainer.append(thumbCanvas)

                let thumbCtx = thumbCanvas.getContext('2d');
                let thumbRif;

                thumbCanvas.width = thumbnailWidth;
                thumbCanvas.height = thumbnailHeight;
                // resize the image to fit 200px on the shortest side and then cut in center to 200 x 200
                if (tempW >= tempH) {
                    thumbRif = tempH;
                }
                else {
                    thumbRif = tempW;
                }
                let widthOffset = (tempW - thumbRif) / 2;
                let heightOffset = (tempH - thumbRif) / 2;

                thumbCtx.drawImage(tempImg, widthOffset, heightOffset, thumbRif, thumbRif, 0, 0, thumbCanvas.width, thumbCanvas.height);

                // create main image canvas
                SkeleUtils.GlobalUtilities.logger('creating main image canvas for loaded image...', 'skeleformField');
                let mainCanvas = $('<canvas/>', {class: 'skeleMainCanvas'})[0];

                $canvasContainer.append(mainCanvas)

                let mainCtx = mainCanvas.getContext('2d');
                let MAX_WIDTH = 1000;
                let MAX_HEIGHT = 1000;

                if (schema.image) {
                    MAX_WIDTH = schema.image.maxWidth || defaults.image.width;
                    MAX_HEIGHT = schema.image.maxHeight || defaults.image.height;
                }

                if (tempW > tempH) {
                    if (tempW > MAX_WIDTH) {
                       tempH *= MAX_WIDTH / tempW;
                       tempW = MAX_WIDTH;
                    }
                } else {
                    if (tempH > MAX_HEIGHT) {
                       tempW *= MAX_HEIGHT / tempH;
                       tempH = MAX_HEIGHT;
                    }
                }
                mainCanvas.width = tempW;
                mainCanvas.height = tempH;
                mainCtx.drawImage(tempImg, 0, 0, tempW, tempH);

                this.isSettingValue = false;
            }
            tempImg.src = imageObject.image;
        }
    };
});
Template.skeleformImageUpload.onDestroyed(function() {
    let Fields = this.data.formInstance.Fields;

    Fields.removeAt(Fields.indexOf(this));
});
Template.skeleformImageUpload.onRendered(function() {
    let editor = this.$('.editor');
    let schema = this.data.schema.get();
    this.currentLang = FlowRouter.getQueryParam('lang');

    this.isActivated.set(true);
    InvokeCallback(this, null, schema, 'onRendered');
});

Template.skeleformImageUpload.events = {
    'change .skeleImageUploader': function(event, instance) {
        let $canvasContainer = instance.$('.skeleCanvasContainer');
        let schema = instance.data.schema.get();
        let images = event.target.files;

        if (images.length === 0) {
            return false;
        }

        $canvasContainer.empty();

        _.each(images, function(image, index) {
            if (!image.type.match('image.*')) {
                Materialize.toast(TAPi18n.__('invalidImage_error'), 5000, 'error');
                SkeleUtils.GlobalUtilities.logger('skipping image ' + index + ': invalid type', 'skeleformField');
            }
            else {
                let reader = new FileReader();

                reader.onloadend = function() {
                    let tempImg = new Image();
                    tempImg.src = reader.result;
                    tempImg.onload = function() {

                        let tempW = tempImg.width;
                        let tempH = tempImg.height;

                        // thumb calculations
                        if (schema.thumbnail) {
                            SkeleUtils.GlobalUtilities.logger('creating image thumb canvas...', 'skeleformField');
                            let thumbCanvas = $('<canvas/>', {class: 'skeleThumbCanvas'})[0];

                            $canvasContainer.append(thumbCanvas)

                            let thumbCtx = thumbCanvas.getContext('2d');
                            let thumbRif;

                            thumbCanvas.width = schema.thumbnail.width || defaults.thumbnail.width;
                            thumbCanvas.height = schema.thumbnail.height || defaults.thumbnail.height;
                            // resize the image to fit 200px on the shortest side and then cut in center to 200 x 200
                            if (tempW >= tempH) {
                                thumbRif = tempH;
                            }
                            else {
                                thumbRif = tempW;
                            }
                            let widthOffset = (tempW - thumbRif) / 2;
                            let heightOffset = (tempH - thumbRif) / 2;
                            thumbCtx.drawImage(this, widthOffset, heightOffset, thumbRif, thumbRif, 0, 0, thumbCanvas.width, thumbCanvas.height);
                        }

                        // main image calculations
                        let mainCanvas = $('<canvas/>', {class: 'skeleMainCanvas'})[0];

                        $canvasContainer.append(mainCanvas)

                        let mainCtx = mainCanvas.getContext('2d');
                        let MAX_WIDTH = 1000;
                        let MAX_HEIGHT = 1000;

                        if (schema.image) {
                            MAX_WIDTH = schema.image.maxWidth || defaults.image.width;
                            MAX_HEIGHT = schema.image.maxHeight || defaults.image.height;
                        }

                        if (tempW > tempH) {
                            if (tempW > MAX_WIDTH) {
                               tempH *= MAX_WIDTH / tempW;
                               tempW = MAX_WIDTH;
                            }
                        } else {
                            if (tempH > MAX_HEIGHT) {
                               tempW *= MAX_HEIGHT / tempH;
                               tempH = MAX_HEIGHT;
                            }
                        }
                        mainCanvas.width = tempW;
                        mainCanvas.height = tempH;
                        mainCtx.drawImage(this, 0, 0, tempW, tempH);

                        // perform validation and callback invocation on change only once after the last image
                        if (index === images.length - 1) {
                            let value = instance.getValue();
                            let result = instance.isValid();
                            let id = schema.name.replace('.', '\\.');

                            if (!result.valid) {
                                setInvalid(id, schema, result);
                            }
                            else {
                                Skeleform.utils.skeleformSuccessStatus(id, schema);
                            }

                            InvokeCallback(instance, value, schema, 'onChange');
                        }
                    };
                };
                reader.readAsDataURL(image);
            }
        });
    }
};
