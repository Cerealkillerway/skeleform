import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


// create buttons (toolbar)
Template.skeleformCreateButtons.events({
    'click .skeleformCreate': function(event, template) {
        let configuration = Skeletor.configuration;
        let formContext = template.data.formContext;
        let fields = formContext.fields;
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
        if (schema.__methods && schema.__methods.create) {
            method = schema.__methods.create;
        }
        else {
            method = configuration.defaultMethods.create;
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
            SkeleUtils.GlobalUtilities.logger('schema name: ' + formContext.schemaName, 'skeleform');
            Meteor.call(method, data, formContext.schemaName, FlowRouter.getParam('itemLang'), function(error, result) {
                if (options.useModal) {
                    $('#gearLoadingModal').closeModal();
                }
                Skeleform.utils.skeleformHandleResult(error, result, 'create', data, schema, formContext.item);
            });
        }
    }
});
