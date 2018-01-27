// update buttons (toolbar)
Template.skeleformUpdateButtons.events({
    'click .skeleformUpdate': function(event, template) {
        let formContext = template.data.formContext;
        let fields = formContext.fields;
        let documentId = formContext.item._id;
        let schema = formContext.schema;
        let method;
        let options = {};
        let data = Skeleform.utils.skeleformGatherData(formContext, fields);

        if (schema.__options) {
            if (schema.__options.loadingModal) {
                options.useModal = true;
            }
        }

        // select method to call for this operation
        if (schema.__methods && schema.__methods.update) {
            method = schema.__methods.update;
        }
        else {
            method = configuration.defaultMethods.update;
        }

        // if necessary launch form callbacks!
        if (schema.formCallbacks && schema.formCallbacks.beforeSave) {
            data = schema.formCallbacks.beforeSave(template.data, data);
        }

        if (Skeleform.validate.skeleformValidateForm(data, fields)) {
            if (options.useModal) {
                $('#gearLoadingModal').openModal();
            }

            SkeleUtils.GlobalUtilities.logger('will now call method: ' + method + ' data:', 'skeleform');
            SkeleUtils.GlobalUtilities.logger(data, 'skeleform');
            SkeleUtils.GlobalUtilities.logger('documentId: ' + documentId, 'skeleform');
            SkeleUtils.GlobalUtilities.logger('schema name: ' + formContext.schemaName, 'skeleform');

            Meteor.call(method, documentId, data, formContext.schemaName, function(error, result) {
                if (options.useModal) {
                    $('#gearLoadingModal').closeModal();
                }

                Skeleform.utils.skeleformHandleResult(error, result, 'update', data, schema.__paths);
            });
        }
    }
});
