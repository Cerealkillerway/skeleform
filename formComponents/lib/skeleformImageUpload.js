// EDITOR
// a textarea with a wysiwyg editor writing html code
// it uses materialNote.js plugin from cerealkiller:materialnote package


// Helpers
Template.skeleformImageUpload.helpers(skeleformGeneralHelpers);
Template.skeleformImageUpload.helpers({
    placeholder: function(name) {
        name = name.split('.');

        for (i = 1; i < name.length; i++) {
            name[i] = name[i].capitalize();
        }
        name = name.join('');

        return TAPi18n.__(name + '_lbl');
    }
});


// Events
Template.skeleformImageUpload.onCreated(function() {
    let schema = this.data.schema;
    this.isActivated = new ReactiveVar(false);

    setReplicaIndex(this);
    InvokeCallback(this, null, schema, 'onCreated');

    //register this on form' store
    this.data.formInstance.Fields.push(this);

    this.getValue = () => {

    };
    this.isValid = () => {

    };
    this.setValue = (value) => {

    };
});
Template.skeleformImageUpload.onDestroyed(function() {
    let Fields = this.data.formInstance.Fields;

    Fields.removeAt(Fields.indexOf(this));
});
Template.skeleformImageUpload.onRendered(function() {
    let editor = this.$('.editor');
    let schema = this.data.schema;
    this.currentLang = FlowRouter.getQueryParam('lang');



    this.isActivated.set(true);
});

Template.skeleformImageUpload.events = {
    'change .imageUploader': function(event, instance) {
        let $canvasContainer = instance.$('.canvasContainer');
        let schema = instance.data.schema;
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
                    let thumbCanvas = $('<canvas/>')[0];

                    $canvasContainer.append(thumbCanvas)

                    let thumbCtx = thumbCanvas.getContext('2d');
                    let thumbRif;

                    thumbCanvas.width = schema.thumbnail.width || 200;
                    thumbCanvas.height = schema.thumbnail.height || 200;
                    //r esize the image to fit 200px on the shortest side and then cut in center to 200 x 200
                    if (tempW >= tempH) {
                        thumbRif = tempH;
                    }
                    else {
                        thumbRif = tempW;
                    }
                    let widthOffset = (tempW - thumbRif) / 2;
                    let heightOffset = (tempH - thumbRif) / 2;
                    thumbCtx.drawImage(this, widthOffset, heightOffset, thumbRif, thumbRif, 0, 0, 200, 200);
                }

                // main image calculations
                if (schema.image) {
                    /*let canvas = $('#' + id + '-mainImage')[0];
                    let ctx = canvas.getContext('2d');
                    let MAX_WIDTH = schema.image.width;
                    let MAX_HEIGHT = schema.image.height;

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
                    ctx.drawImage(this, 0, 0, tempW, tempH);*/
                }
            };
        };
        reader.readAsDataURL(event.target.files[0]);

    }
};
