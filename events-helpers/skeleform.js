// ==========================================================================================
// SKELEFORM MANAGEMENT
// ==========================================================================================

var debugType = "skeleform";
var skeleformInstance;

// get configuration from skeletor or from the app
if (Package['cerealkiller:skeletor']) {
    var configuration = Package['cerealkiller:skeletor'].Skeletor.configuration;
    ckUtils.globalUtilities.logger ('loaded configuration:', 'skeleform');
    ckUtils.globalUtilities.logger (Package['cerealkiller:skeletor'].Skeletor.configuration, 'skeleform');
}


// GATHERING
// ==========================================================================================
// gather data from form's fields
// the "all" parameter forces to gather everything (see skeleformGetValue function)
skeleformGatherData = function(template, all, update) {
    var data = {};
    var id;
    var item;
    var currentLang = FlowRouter.getParam('itemLang');

    data[currentLang] = {};

    if (template.data.item) {
        item = template.data.item;
    }

    $.each(skeleformInstance.$(".gather"), function(index, element) {
        skeleformGetValue(element, template, data, item, all, currentLang);
    });

    if (update) {
        // put everything on first level
        var grounded =  _.object(_.map(data[currentLang], function (value, key) {
            return [currentLang + '.' + key, value];
        }));
        delete data[currentLang];
        _.extend(data, grounded);
    }

    ckUtils.globalUtilities.logger('separator form gathered data:', 'skeleform');
    ckUtils.globalUtilities.logger(data, 'skeleform');

    return data;
};

// Gets the value(s) of a field
// the default behaviour is to gather only data that is changed from current document (if one); this is
// done in order to be efficient during data transfer to server;
// is possible to override passing true as "all" parameter (in this case will always gather everything)
skeleformGetValue = function(element, template, data, item, all, currentLang) {
    var tagName = $(element).prop('tagName').toLowerCase();
    var id = $(element).attr('id');
    var schema;
    var schemaElement;
    var tmpValue;
    var field;
    var currentItem;

    schema = template.data.schema[id];
    if (schema) {
        schemaElement = schema.output;
        if (item) {
            currentItem = item;

            if (schema.i18n === undefined) {
                if (item[currentLang] !== undefined) {
                    currentItem = currentItem[currentLang];
                }
            }
            
            var pathShards = id.split('.');

            pathShards.forEach(function(shard, index) {
                currentItem = currentItem[shard];
            });
        }
    }

    switch (schemaElement) {
        case 'editor':
            tmpValue = $(element).code().trim();

            if (all || !item || !ckUtils.globalUtilities.areEquals(currentItem, tmpValue)) {
                if (schema.i18n === undefined) {
                    data[currentLang][id] = tmpValue;
                }
                else {
                    data[id] = tmpValue;
                }
            }
            break;

        case 'datePicker':
            tmpValue = $('#' + id).siblings('input:hidden').first().val();
            if (all || !item || !ckUtils.globalUtilities.areEquals(currentItem, tmpValue)) {
                if (schema.i18n === undefined) {
                    data[currentLang][id] = tmpValue;
                }
                else {
                    data[id] = tmpValue;
                }
            }
            break;

        case 'input':
            tmpValue = $($(element)).val();

            if (all || !item || !ckUtils.globalUtilities.areEquals(currentItem, tmpValue)) {
                if (schema.i18n === undefined) {
                    data[currentLang][id] = tmpValue;
                }
                else {
                    data[id] = tmpValue;
                }
            }
            break;

        case 'select':
            tmpValue = $(element).val();

            if (all || !item || !ckUtils.globalUtilities.areEquals(currentItem, tmpValue)) {
                if (schema.i18n === undefined) {
                    data[currentLang][id] = tmpValue;
                }
                else {
                    data[id] = tmpValue;
                }
            }
            break;

        default:
            return undefined;
    }
};


// VALIDATION
// ==========================================================================================
//looks up for translated string if argument is not a number
function translateErrorDetail(detail) {
    var regex = /^([0-9]|[ #\-\+\(\)])+$/;
    if (regex.test(detail) === false) return TAPi18n.__(detail + "_validationDetail");
    return detail;
}

//validation loop for entire form against fields' values
skeleformValidateForm = function(data, schema) {
    var valid = true;
    var currentLang = FlowRouter.getParam('itemLang');

    for (var field in data) {
        var unNestedField = field;

        if (currentLang && field.indexOf(currentLang + '.') === 0) {
            unNestedField = field.replace(currentLang + '.', '');
        }

        if (schema[unNestedField]) {
            if (!skeleformValidateField(data[field], {schema: schema[unNestedField], item: Template.instance().data.item})) {
                valid = false;
                ckUtils.globalUtilities.logger('VALIDATION - failed on field: ' + field, debugType);
            }
            //check also shadowField if exists
            if (schema[unNestedField].shadowConfirm) {
                var id = '#' + schema[unNestedField].name + 'ShadowConfirm';
                var shadowValue = $(id).val();

                if (data[field] !== shadowValue) {
                    valid = false;
                    skeleformErrorStatus(id, TAPi18n.__("confirm_validation"));
                }
            }
        }
    }
    //scroll to meet the first error
    if (!valid) {
        ckUtils.globalUtilities.scrollTo($('.invalid').first().offset().top - 80, Skeletor.configuration.animations.scrollError);
    }

    return valid;
};

//validation for single field
//called directly for inline validation
skeleformValidateField = function(value, data) {
    var item = data.item;
    var schema = data.schema;

    var documentId;

    if (item) {
        documentId = item._id;
    }

    if (!Session.get('formRendered')) return;
    var collection = skeleformInstance.data.schema.__collection;
    var id = "#" + schema.name.replace('.', '\\.');
    var result = isValid(value, schema, collection, documentId);
    
    if (!result.valid) {
        ckUtils.globalUtilities.logger('VALIDATION - invalid ' + id, debugType);
        var errorString = "";

        result.reasons.forEach(function(rValue, rIndex) {
            if (rIndex > 0) errorString = errorString +' - ';

            var errorDetail;
            if (schema !== undefined) errorDetail = translateErrorDetail(schema[rValue]);
            errorString = errorString + TAPi18n.__(rValue + "_validation", errorDetail);
        });

        skeleformErrorStatus(id, errorString, schema.output);
    }
    else {
        skeleformSuccessStatus(id, schema.output);
    }
    return result.valid;
};

//reset success and error status on the form
skeleformResetStatus = function(id) {
    var element = $('#' + id);
    var column = element.closest('.col');

    if (id) {
        column.alterClass('valid', '');
        column.find('.skeleformFieldAlert').html("");
    }
    else {
        $('.col').alterClass('valid', '');
        $('.skeleformFieldAlert').html("");
    }
};

//set success status
skeleformSuccessStatus = function(id, special) {
    var element = $(id);
    var column = element.closest('.col');
    var fieldAlert = column.find('.skeleformFieldAlert');

    column.alterClass('invalid', 'valid');
    fieldAlert.html("");
};

//set error status
skeleformErrorStatus = function(id, errorString, special) {
    var element = $(id);
    var column = element.closest('.col');
    var fieldAlert = column.find('.skeleformFieldAlert');
    
    column.alterClass('valid', 'invalid');
    fieldAlert.html(TAPi18n.__("error_validation", errorString));
};

//clean up the form
skeleformCleanForm = function() {
    //empty input fields
    $('input.skeleValidate').val('');
    $('input.shadowField').val('');
    //empty editors
    $('.editor').code('');
    //select first option on select boxes
    $('select.skeleValidate').val('admin');

    $('.fileLoader').value = "";
    $('.fileLoader').siblings('.fleNameContainer').html('');

    $.each($('canvas'), function(index, canvas) {
        $(canvas).removeClass('canvasImage');
        $(canvas).removeClass('canvasThumb');
        $(canvas).parent().addClass('canvasContainerEmpty');

        canvas.width = 300;
        canvas.height = 150;

        var ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    skeleformResetStatus();
};

//handle method results and performs error/success operations on the client
skeleformHandleResult = function(error, result, type, data, paths) {
    if (error) {
        Materialize.toast(TAPi18n.__("serverError_error"), 5000, 'error');
    }
    else {
        var title, content;
        switch (type) {
            case 'update':
            title = TAPi18n.__("updateConfirm_msg");
            content = TAPi18n.__("pageUpdatedOk_msg");
            break;

            case 'create':
            title = TAPi18n.__("insertConfirm_msg");
            content = TAPi18n.__("genericInsert_msg");
            skeleformCleanForm();
            break;
        }

        Materialize.toast(content, 1300, 'success', function() {
            var redirectPath = paths['redirectOn' + type.capitalize()];
            if (paths['redirectOn' + type.capitalize()]) {
                var params = {};

                _.keys(redirectPath[1]).forEach(function(param) {
                    if (redirectPath[1][param] === 'this') {
                        if (params[param]) {
                            params[param] = data[param];
                        }
                        else {
                            params[param] = data[FlowRouter.getParam('itemLang')][param];
                        }
                    }
                    else {
                        params[param] = redirectPath[1][param];
                    }
                });
                Session.set('currentItem', undefined);    // reset skelelist's setted currentItem

                FlowRouter.go(redirectPath[0], params, {lang: FlowRouter.getQueryParam("lang")});
            }
        });
    }
};


// HELPERS
// ==========================================================================================
Template.skeleform.helpers({
    fields: function(schema) {
        var fields = [];

        for (var key in schema) {
            if ((schema.hasOwnProperty(key)) && (key.indexOf('__') !== 0)) {
                var field = schema[key];
                field.name = key;
                fields.push(field);
            }
        }
        return fields;
    },
    fieldType: function(output, schema, item) {
        return {
            template: "skeleform" + output.capitalize(),
            data: {
                schema: schema,
                item: item
            }
        };
    },
    isNeeded: function(fieldSchema, data) {
        if (!fieldSchema.useOnly) {
            return true;
        }
        else {
            switch(fieldSchema.useOnly) {
                case 'create':
                if (data.item) {
                    return false;
                }                
                return true;

                case 'update':
                if (data.item) {
                    return true;
                }                
                return false;

                default:
                return true;
            }
        }
    }
});

//helpers used by form elements
skeleformGeneralHelpers = {
    label: function(name, options) {
        name = name.substring(name.lastIndexOf('.') + 1, name.length);

        switch(options) {
            case 'shadowConfirm':
            return TAPi18n.__(name + "ShadowConfirm_lbl");

            default:
            return TAPi18n.__(name + "_lbl");
        }
    },
    field: function(name) {
        return name;
    },
    required: function() {
        if (this.schema.min !== undefined) return " *";
        return "";
    },
    fieldStyle: function(context) {
        if (context.icon || context.unit) return 'float: left;';

        return "";
    },
    fieldSize: function(size) {
        if (!size) return "s12 m6";
        return size;
    },
    fieldValue: function(data, schema) {
        var name = schema.name;

        if (!data) return;

        if (schema.i18n === undefined) {
            data = data[FlowRouter.getParam('itemLang')];
            if (!data) return;
        }

        var pathShards = name.split('.');

        pathShards.forEach(function(shard, index) {
            data = data[shard];
        });

        return data;
    }
};


// SKELEFORM HOOKS
// ==========================================================================================
Template.skeleform.onCreated(function() {
    Session.set('formRendered', false);
});
Template.skeleform.onRendered(function() {
    var self = this;
        skeleformInstance = self;

    ckUtils.globalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);

    Session.set('formRendered', true);
    Tracker.autorun(function() {
        if (FlowRouter.subsReady()) {
            skeleformResetStatus();    // clean validation alerts
        }
    });

    // set toolbar in container if needed
    var toolbar = this.data.schema.__toolbar;
    if (toolbar && toolbar.containerId) {
        Blaze.renderWithData(Template[toolbar.template], this.data, $('#' + toolbar.containerId)[0]);
    }

    $('input:first').focusWithoutScrolling();

    Tracker.autorun(function() {
        if (Session.equals('appRendered', true)) {
            // static bar
            var $bar = $('.skeleformToolbar');

            if ($bar.length > 0) {
                var barOffset = Math.round($bar.offset().top * 1) / 1;
                ckUtils.globalUtilities.logger ('static bar calculated offset: ' + barOffset, 'skeleform');

                $(window).on('scroll', function() {
                    if ($(document).scrollTop() >= barOffset) {
                        $('.staticBar').addClass('staticTop');
                        $('.staticTop').children().addClass('centralBody hPadded');
                    }
                    else {
                        $('.staticTop').children().removeClass('centralBody hPadded');
                        $('.staticBar').removeClass('staticTop');
                    }
                });
            }
        }
    });
});

Template.skeleform.destroyed = function() {
    $(window).unbind('scroll');
};

// SKELEFORM DEFAULT TOOLBAR
// ==========================================================================================
Template.skeleformCreateButtons.events({
    "click .skeleformCreate": function(event, template) {
        var data = skeleformGatherData(template);
        var schema = template.data.schema;
        var method;
        var options = {};

        if (schema.__options) {
            if (schema.__options.loadingModal) {
                options.useModal = true;
            }
        }

        if (!template.data.method) {
            method = configuration.defaultMethods.insert;
        }
        else {
            method = template.data.method.insert;
        }

        if (skeleformValidateForm(data, schema)) {
            if (options.useModal) {
                $('#gearLoadingModal').openModal();
            }

            Meteor.call(method, data, template.data.schemaName, function(error, result) {
                if (options.useModal) {
                    $('#gearLoadingModal').closeModal();
                }
                skeleformHandleResult(error, result, 'create', data, schema.__paths);
            });
        }
    }
});


Template.skeleformUpdateButtons.events({
    "click .skeleformUpdate": function(event, template) {
        var data = skeleformGatherData(template, false, true);
        var documentId = template.data.item._id;
        var schema = template.data.schema;
        var method;
        var options = {};

        if (schema.__options) {
            if (schema.__options.loadingModal) {
                options.useModal = true;
            }
        }

        if (!template.data.method) {
            method = configuration.defaultMethods.update;
        }
        else {
            method = template.data.method.update;
        }

        // get route params to manage if current update should redirect to a new path
        var currentRoute = FlowRouter.current();
        var params = currentRoute.params;

        ckUtils.globalUtilities.logger ('url change monitor:', 'skeleform');
        ckUtils.globalUtilities.logger(params, 'skeleform');
        params = _.keys(params);
        dataKeys = _.keys(data);
        var unNestedDataKeys = [];
        var relationships = {};

        dataKeys.forEach(function(dataKey, index) {
            var unNested = dataKey.split('.');
                unNested = unNested[unNested.length - 1];

            unNestedDataKeys.push(unNested);
            relationships[unNested] = dataKey;  // save original name of un-nested param
        });

        var changedParams = _.intersection(params, unNestedDataKeys);
        
        if (skeleformValidateForm(data, schema)) {
            if (options.useModal) {
                $('#gearLoadingModal').openModal();
            }

            Meteor.call(method, documentId, data, template.data.schemaName, function(error, result) {
                if (options.useModal) {
                    $('#gearLoadingModal').closeModal();
                }
                skeleformHandleResult(error, result, 'update', data, schema.__paths);
            });
            if (changedParams.length > 0) {
                var newParams = {};

                changedParams.forEach(function(param, index) {
                    newParams[param] = data[relationships[param]];
                });
                FlowRouter.setParams(newParams);
            }
        }
    }
});

// SkeleformLangBar
Template.skeleformLangBar.helpers({
    langs: function() {
        var result = [];

        if (Skeletor.GlobalConf) {
            _.each(Skeletor.GlobalConf.langEnable, function(value, key) {
                if (value) {
                    result.push(key);
                }
            });

            return result;
        }
    },
    isActive: function(buttonLang) {
        if (FlowRouter.getParam('itemLang') === buttonLang) {
            return 'active';
        }
    }
});
Template.skeleformLangBar.events({
    "click .langFlag": function(event, template) {
        var newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});


Template.skeleformStaticAddons.events({
    "click .toTop": function(event, template) {
        ckUtils.globalUtilities.scrollTo(0, Skeletor.configuration.animations.scrollTop);
    },
    "click .toBottom": function(event, template) {
        ckUtils.globalUtilities.scrollTo($('body').height(), Skeletor.configuration.animations.scrollBottom);
    }
});
