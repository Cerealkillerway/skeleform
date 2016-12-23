// IMAGE UPLOAD
// a field to upload an image, converting it into dataURL;
// it can manage both the image and create a thumbnail from it

skeleformImageWithThumbEvents = {
    "change .imageUploader": function(event, template) {
        var canvasContainer = template.$('.canvasContainer');
        var fileNameContainer = template.$('.file-path');
        var id = canvasContainer.attr('id');
        var schema = template.data.schema;

        template.$('.file-path').prop('disabled', false);

        //changed field state
        var changed = Router.current().state.get('changed');
        changed[template.data.schema.name] = ['image', 'title'];
        Router.current().state.set('changed', changed);

        $(event.target).parent().parent().removeClass('invalid');

        //remove class for image placeholder in canvas container
        canvasContainer.removeClass('canvasContainerEmpty');

        //set selected file's name to fileNameContainer
        fileNameContainer.val(getFileName(event.target.files[0].name));

        //assign class to canvas for styling
        canvasContainer.children('.willContainImage').addClass('canvasImage');
        canvasContainer.children('.willContainThumb').addClass('canvasThumb');

        var reader = new FileReader();

        reader.onloadend = function() {
            var tempImg = new Image();
            tempImg.src = reader.result;
            tempImg.onload = function() {

                var tempW = tempImg.width;
                var tempH = tempImg.height;

                // thumb calculations
                if (schema.thumb) {
                    var thumbCanvas = $('#' + id + '-mainImageThumb')[0];
                    var thumbCtx = thumbCanvas.getContext('2d');
                    var thumbRif;

                    thumbCanvas.width = schema.thumb.width;
                    thumbCanvas.height = schema.thumb.height;
                    //r esize the image to fit 200px on the shortest side and then cut in center to 200 x 200
                    if (tempW >= tempH) {
                        thumbRif = tempH;
                    }
                    else {
                        thumbRif = tempW;
                    }
                    var widthOffset = (tempW - thumbRif) / 2;
                    var heightOffset = (tempH - thumbRif) / 2;
                    thumbCtx.drawImage(this, widthOffset, heightOffset, thumbRif, thumbRif, 0, 0, 200, 200);
                }

                // main image calculations
                if (schema.image) {
                    var canvas = $('#' + id + '-mainImage')[0];
                    var ctx = canvas.getContext('2d');
                    var MAX_WIDTH = schema.image.width;
                    var MAX_HEIGHT = schema.image.height;

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
                    canvas.width = tempW;
                    canvas.height = tempH;
                    ctx.drawImage(this, 0, 0, tempW, tempH);
                }
            };
        };
        reader.readAsDataURL(event.target.files[0]);
        canvasContainer.children('.imageDelete').show(0);
        skeleformSuccessStatus('#' + template.data.schema.name, template.data.schema.output);
    },
    "click .imageDelete": function(event, template) {
        var canvasContainer = template.$('.canvasContainer');
        var fileNameContainer = template.$('.file-path');
        var deleteBtn = template.$('.imageDelete');
        var schema = template.data.schema;
        var id = schema.name;

        fileNameContainer.prop('disabled', true);

        //changed field state
        /*var changed = Router.current().state.get('changed');
        changed[template.data.schema.name] = ['deleted'];
        Router.current().state.set('changed', changed);*/

        if (schema.thumb) {
            var thumbCanvas = $('#' + id + '-mainImageThumb')[0];
            var thumbCtx = thumbCanvas.getContext('2d');
            thumbCtx.clearRect(0, 0, thumbCtx.canvas.width, thumbCtx.canvas.height);

            //remove class to canvas for styling
            canvasContainer.children('.willContainThumb').removeClass('canvasThumb');
        }
        if (schema.image) {
            var canvas = $('#' + id + '-mainImage')[0];
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            //remove class to canvas for styling
            canvasContainer.children('.willContainImage').removeClass('canvasImage');
        }

        //add class for image placeholder in canvas container
        canvasContainer.addClass('canvasContainerEmpty');
        //set selected file's name to fileNameContainer
        canvasContainer.prev('.inputContainer').children('.fileNameContainer').val("");
        //hide itself
        deleteBtn.hide(0);

        //error status if required
        if (template.data.schema.min) skeleformErrorStatus('#' + id, TAPi18n.__("required_validationDetail"), template.data.schema.output);
    },
    "keyup .file-path": function(event, template) {
        var canvasContainer = $(event.target).parent().next('.canvasContainer');
        var imageCanvas = canvasContainer.children('.willContainImage')[0];
        var thumbCanvas = canvasContainer.children('.willContainThumb')[0];
        var emptyCanvas = canvasContainer.children('.canvasBlank')[0];
        var empty = {
            image: true,
            thumb: true
        };

        //changed field state
        /*var changed = Router.current().state.get('changed');
        changed[template.data.schema.name].pushUnique('title');
        Router.current().state.set('changed', changed);*/
    }
};

Template.skeleformImageUpload.helpers(skeleformGeneralHelpers);
Template.skeleformImageUpload.helpers({
    fieldImage: function(data, attribute) {
        if (!data || !data.fetch()[0]) return false;

        var canvasContainer = $('#' + attribute);
        var images = data.fetch()[0][attribute];
        var template = Template.instance();

        if (Session.get('formRendered')) {
            if (!images || _.isEmpty(images)) {
                canvasContainer.children('.imageDelete').hide(0);
                return false;
            }
            var fileNameContainer = template.$('.file-path');

            //remove class for image placeholder in canvas container
            canvasContainer.removeClass('canvasContainerEmpty');
            //set selected file's name to fleNameContainer
            fileNameContainer.val(images.title);

            //main image
            if (Template.instance().data.schema.image) {
                var canvas = $('#' + attribute + '-mainImage')[0];
                var ctx = canvas.getContext('2d');
                var canvasDataUrl = images.mainImage;
                var canvasImage = new Image();

                canvasContainer.children('.willContainImage').addClass('canvasImage');
                canvasImage.src = canvasDataUrl;
                canvas.width = canvasImage.width;
                canvas.height = canvasImage.height;
                canvasImage.onload = function() {
                    ctx.drawImage(this, 0, 0);
                };
            }

            //main thumb
            if (Template.instance().data.schema.thumb) {
                var thumbCanvas = $('#' + attribute + '-mainImageThumb')[0];
                var thumbCtx = thumbCanvas.getContext('2d');
                var thumbCanvasDataUrl = images.mainImageThumb;
                var thumbCanvasImage = new Image();

                canvasContainer.children('.willContainThumb').addClass('canvasThumb');
                thumbCanvasImage.src = thumbCanvasDataUrl;
                thumbCanvas.width = thumbCanvasImage.width;
                thumbCanvas.height = thumbCanvasImage.height;
                thumbCanvasImage.onload = function() {
                    thumbCtx.drawImage(this, 0, 0);
                };
            }

            canvasContainer.children('.imageDelete').show(0);
        }
    }
});

Template.skeleformImageUpload.events(skeleformImageWithThumbEvents);

Template.skeleformImageUpload.rendered = function() {
    var id = this.data.schema.name;
    //var changed = Router.current().state.get('changed');
    var filePathInput = this.$('.file-path');

    //changed[id] = [];
    //Router.current().state.set('changed', changed);
};
