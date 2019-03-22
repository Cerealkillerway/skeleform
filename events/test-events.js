import Sortable from 'sortablejs';

Template.skelePanelTest.onRendered(function() {
    let items = this.$('.container')[0];
    let sortable = Sortable.create(items, {
        animation: 150
    });
});
