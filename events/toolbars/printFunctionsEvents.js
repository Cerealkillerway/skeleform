// skeleform print functions
Template.skeleformPrintFunctions.events({
    'click .skeleformPrintPreview': function(event, template) {
        Skeleform.utils.restoreSavedData(template.data.formContext);


        return;

        let formContext = template.data.formContext;
        let schema = formContext.schema;
        let printOptions = schema.__toolbar.printFunctions;
        let $printPreviewContainer;
        let content = {};
        let data = Skeleform.utils.skeleformGatherData(formContext, formContext.fields);
        let htmlContent;

        let pageOptions = {
            width: 210,
            height: 297,
            marginTop: 20,
            marginBottom: 30,
            marginLeft: 20,
            marginRight: 20
        }

        function addPage($container, pageNumber, pageOptions, content) {
            $container.append('<h3 class="skeleformPrintPageTitle">' + TAPi18n.__("page_lbl") + ' ' + (pageNumber) + ' / <span class="skeleformTotalPagesCounter">...</span></h3>');
            let $page = $('<div>', {
                class: 'skeleformPrintPage',
                css: {
                    padding: pageOptions.marginTop + 'mm ' + pageOptions.marginRight + 'mm ' + pageOptions.marginBottom + 'mm ' + pageOptions.marginLeft + 'mm',
                    width: pageOptions.width + 'mm',
                    height: pageOptions.height + 'mm'
                }
            });

            $container.append($page);
            $page.append(htmlContent);
        }

        if (printOptions.printPreviewContainer) {
            $printPreviewContainer = $(printOptions.printPreviewContainer).find('.skeleformPrintArea');
        }
        else {
            $printPreviewContainer = $(template.firstNode).closest('.skeleform').find('.skeleformPrintArea');
        }
        $printPreviewContainer.empty();

        content = _.extend(content, formContext.item, data);

        if (printOptions.transformDataForPrint) {
            content = printOptions.transformDataForPrint(content);
        }

        // if defined, call the custom function to generate the HTML to insert
        if (printOptions.generatePrintHTML) {
            htmlContent = printOptions.generatePrintHTML(content);
        }
        // otherwise just create a new <div> for each data value
        else {
            htmlContent = [];

            _.each(content, function(value, key) {
                htmlContent.push($('<div>', {
                    text: value
                }));
            });
        }

        addPage($printPreviewContainer, 1, pageOptions, htmlContent);


        // scroll to print preview
        $('html, body').animate({
            scrollTop: ($printPreviewContainer.offset().top - 120)
        }, 500);
    }
});
