Template.skeleformButton.helpers(skeleformGeneralHelpers);
Template.skeleformButton.helpers({
	confirmModalString: function(type) {
		let fieldSchema = Template.instance().data.fieldSchema.get();
		let i18n = Skeletor.Skelelang.i18n;

		switch (type) {
			case 'body':
			if (fieldSchema.confirmModal && fieldSchema.confirmModal.body) {
				return i18n.get(fieldSchema.confirmModal.body);
			}
			else {
				return i18n.get('confirmAction_msg');
			}

			case 'okButton':
			if (fieldSchema.confirmModal && fieldSchema.confirmModal.okButton) {
				return i18n.get(fieldSchema.confirmModal.okButton);
			}
			else {
				return i18n.get('ok_btn');
			}

			case 'cancelButton':
			if (fieldSchema.confirmModal && fieldSchema.confirmModal.cancelButton) {
				return i18n.get(fieldSchema.confirmModal.cancelButton);
			}
			else {
				return i18n.get('cancel_btn');
			}

			default:
			if (fieldSchema.confirmModal && fieldSchema.confirmModal.title) {
				return i18n.get(fieldSchema.confirmModal.title);
			}
			else {
				return i18n.get('confirmAction_lbl');
			}
		}
	},

	confirmModalIcon: function(type) {
		let fieldSchema = Template.instance().data.fieldSchema.get();

		if (fieldSchema.confirmModal && fieldSchema.confirmModal.icons && fieldSchema.confirmModal.icons[type]) {
			return fieldSchema.confirmModal.icons[type];
		}

		switch (type) {
			case 'cancelButton':
			return 'undo';

			default:
			return 'done';
		}
	}
})


Template.skeleformButton.onCreated(function() {
    this.isActivated = new ReactiveVar(false);

    let fieldSchema = this.data.fieldSchema.get();
});


Template.skeleformButton.onRendered(function() {
	let fieldSchema = this.data.fieldSchema.get();

	if (fieldSchema.confirmAction) {
		let modalId =  Skeleform.utils.createFieldId(this, fieldSchema.name) + 'Modal';

		this.confirmModal = this.$('#' + modalId).modal();
	}
});


Template.skeleformButton.events({
	'click .btn': function(event, instance) {
		let fieldSchema = instance.data.fieldSchema.get();
		let action = fieldSchema.action;

		if (fieldSchema.confirmAction) {
			instance.confirmModal.modal('open');
		}
		else {
			action(instance);
		}
	},

	'click .confirmModalUndo': function(event, instance) {
		instance.confirmModal.modal('close');
	},

	'click .confirmModalConfirm': function(event, instance) {
		let fieldSchema = instance.data.fieldSchema.get();

		instance.confirmModal.modal('close');
		fieldSchema.action(instance);
	}
})
