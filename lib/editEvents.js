// library for inline editing

var memEdit = {
    Elements: {},
    Municipalities: {},
    CulturalGoods: {}
};

function typeOfPermission(collectionName) {
    var permissionType;

    switch (collectionName) {
        case 'Elements':
        permissionType = 'editorOperations';
        break;

    }
    return permissionType;
}

editorEvents = {
    "keyup .note-editable": function(event) {
        $(event.target).parent().parent().parent().removeClass('has-warning');
    }
};

editEvents = {
    "click section.editable": function(event) {
        var container;

        if ($(event.target).is('section')) container = $(event.target);
        else container = $(event.target).closest('section');

        var documentId = container.attr("data-id");
        var collection = container.attr("data-collection");

        var permissionType = typeOfPermission(collection);

        if (/*checkPermissions(permissionType, Meteor.userId())*/ true) {

            var field = container.attr("data-field");
            var lang = Session.get('currentLang');

            //create memEdit object needed properties
            if (!memEdit[collection].hasOwnProperty(documentId)) {
                memEdit[collection][documentId] = {};
                memEdit[collection][documentId][lang] = {};
            }
            else {
                if (!memEdit[collection][documentId].hasOwnProperty(lang)) {
                    memEdit[collection][documentId][lang] = {};
                }
            }
            //save in memEdit the current value
            memEdit[collection][documentId][lang][field] = container.html().trim();

            // Remove all the other editors before creating a new one
            //$(".editContainer > section").destroy();
            //$(".editContainer > section").addClass('editable');
            //$(".editContainer .commands").addClass('hidden');

            container.removeClass('editable');

            container.summernote({
                lang: 'it-IT',
                toolbar: [
                    ['style', ['style', 'bold', 'italic', 'underline', 'clear']],
                    ['fontsize', ['fontsize']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['height', ['height']],
                    ['misc', ['link', 'picture', 'codeview', 'fullscreen']]
                ],
                oninit: function() {
                    $(window).unbind("scroll");

                    $.each($('.note-editor'), function(index, editor) {

                        var toolBar = $(editor).find('.note-toolbar');
                        var tHeight = $(editor).find('.note-toolbar').outerHeight();

                        $(editor).find('.note-editable').css({'margin-top': tHeight + 'px'});
                        $(editor).find('.note-codable').css({'margin-top': tHeight + 'px'});

                        /*var initialGap = $(toolBar).offset().top;
                        var editHeight = $(editor).find('.note-editable').outerHeight();

                        $(window).bind("scroll", function() {
                            var difference = $(window).scrollTop() - initialGap;
                            console.log(initialGap);

                            if ($(window).scrollTop() > initialGap) {
                                if (difference < editHeight) {
                                    $(editor).find('.note-toolbar').css({'top': difference + 'px'});
                                }
                            }
                            else {
                                $(editor).find('.note-toolbar').css({'top': 0});
                            }
                        });*/

                    });
                }
            });
            container.closest('.editContainer').children('.commands').removeClass('hidden');
        }
    },

    "click div.editSave": function(event) {

        var container = $(event.target).parent().siblings('section');console.log(container);
        var documentId = container.attr("data-id");
        var collection = container.attr("data-collection");
        var field = container.attr("data-field");
        var lang = Session.get('currentLang');
        var wysiwygContent = container.code().trim();

        //check if editor content is empty -> show modalbox with empty field error
        if (wysiwygContent.length === 0) {
            $('#errorEmpty').modal('show');
            return false;
        }

        container.destroy();
        container.addClass('editable');

        $(event.target).parent('.commands').addClass('hidden');

        //Check if nothing changed -> no necessary to update
        if (memEdit[collection][documentId][lang][field] === wysiwygContent) {
            return false;
        }

        //prevent duplicate content
        container.html('');

        var element;
        var updateData = {};
        var method;

        switch (collection) {
            case 'Elements':
            method = 'updateElement';
            break;

        }

        updateData[lang + '.' + field] = wysiwygContent;

        Meteor.call(method, documentId, updateData, lang, function() {
            //alert("salvato");
        });
    },

    "click div.editCancel": function(event) {
        var container = $(event.target).parent().siblings('section');
        var documentId = container.attr("data-id");
        var collection = container.attr("data-collection");
        var field = container.attr("data-field");
        var lang = Session.get('currentLang');

        container.destroy();
        container.addClass('editable');

        //rollback previous value from memEdit object
        container.html(memEdit[collection][documentId][lang][field]);

        //cleanup memEdit object
        delete memEdit[collection][documentId][lang][field];
        if (Object.keys(memEdit[collection][documentId][lang]).length === 0) {

            delete memEdit[collection][documentId][lang];

            if (Object.keys(memEdit[collection][documentId]).length === 0) {
                delete memEdit[collection][documentId];
            }
        }

        //console.log(memEdit);
        $(event.target).parent('.commands').addClass('hidden');
    }
};
