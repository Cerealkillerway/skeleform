import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let configuration = Skeletor.configuration;


// Skeleform
Template.skeleform.onCreated(function() {
    this.formRendered = new ReactiveVar(false);
    this.plugins = {
        sortables: {}
    };
    this.fields = [];
    this.skeleDebug = new ReactiveVar(false);
    this.replicaVars = {};
    this.replicas = {};
    this.autoSaves = [];
    this.isRestoringData = false;
});


Template.skeleform.onRendered(function() {
    let data = this.data;
    let schema = data.schema;

    this.formRendered.set(true);

    if (schema.__autoScrollTop !== false) {
        Skeletor.SkeleUtils.GlobalUtilities.scrollTo(0, configuration.animations.onRendered);
    }

    // set toolbar in container if needed
    let toolbar = schema.__toolbar;

    if (toolbar) {
        if (toolbar.containerId) {
            /*if (data.Fields === undefined) {
                data.Fields = this.Fields;
            }*/
            let toolbarContext = {
                Fields: this.Fields,
                formContext: this.data
            };
            this.toolbarInstance = Blaze.renderWithData(Template[toolbar.template], toolbarContext, $('#' + toolbar.containerId)[0]);
        }

        // append print area if needed
        if (toolbar.printFunctions) {
            let printOptions = toolbar.printFunctions;
            let printAreaMarkup = $('<div>', {class: 'skeleformPrintArea'});

            if (printOptions.printPreviewContainer) {
                $(printOptions.printPreviewContainer).append(printAreaMarkup);
            }
            else {
                this.$('.skeleform').append(printAreaMarkup);
            }
        }
    }

    if (schema.__autoFocusFirst !== false) {
        let $skeleFields = this.$('.skeleGather');

        for (const field of $skeleFields) {
            let $field = $(field);

            if ($field.hasClass('editor')) {
                $field.focusWithoutScrolling();
                break;
            }
            if ($field.is('input') || $field.is('textarea')) {
                if ($field.is(':visible')) {
                    $field.focusWithoutScrolling();
                    break;
                }
            }
        }
    }

    this.autorun(function() {
        if (data.skeleSubsReady.get()) {
            // clean validation alerts
            Skeleform.validate.skeleformResetStatus();
        }
    });

    this.autorun(() => {
        // register dependency from form's language
        let formLang = FlowRouter.getParam('itemLang');
        // register dependency from form's data
        let item = this.data.item;

        if (this.data.skeleSubsReady.get()) {
            // fire onRendered callback if it's defined
            if (schema.formCallbacks && schema.formCallbacks.onRendered) {
                schema.formCallbacks.onRendered(item, this);
            }
        }
    });

    this.autorun(function() {
        if (Skeletor.appRendered.get() === true) {
            // static bar
            let $bar = $('.skeleformToolbar');

            if ($bar.length > 0) {
                let barOffset = Math.round($bar.offset().top * 1) / 1;

                Skeletor.SkeleUtils.GlobalUtilities.logger ('static bar calculated offset: ' + barOffset, 'skeleform');

                $(window).on('scroll', function() {
                    let $placeholder = this.$('.skeleskeleStaticBarPlaceholder');

                    if ($(document).scrollTop() >= barOffset) {
                        let height = $('.skeleStaticBar').outerHeight();

                        if (height > $placeholder.height()) {
                            $placeholder.height(height);
                        }

                        $('.skeleStaticBar').addClass('skeleStaticTop');
                        $('.skeleStaticTop').children().addClass('skeleCentralBody hPadded');
                    }
                    else {
                        $placeholder.height(0);
                        $('.skeleStaticTop').children().removeClass('skeleCentralBody hPadded');
                        $('.skeleStaticBar').removeClass('skeleStaticTop');
                    }
                });
            }
        }
    });
});


Template.skeleform.onDestroyed(function() {
    if (this.toolbarInstance) {
        Blaze.remove(this.toolbarInstance);
    }

    let data = this.data;
    let schema = data.schema;

    // if necessary call "onClose" callback
    if (schema.formCallbacks && schema.formCallbacks.onClose) {
        schema.formCallbacks.onClose(data.item, this);
    }

    $(window).unbind('scroll');
});
