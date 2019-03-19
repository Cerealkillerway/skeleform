import Chart from 'chart.js';


// helpers
Template.skeleformChart.helpers(skeleformGeneralHelpers);


// events
Template.skeleformChart.onCreated(function() {
    Skeleform.utils.registerField(this);
    this.isActivated = new ReactiveVar(false);
    this.subscriptionsReady = new ReactiveVar(false);
    this.sourceSet = new ReactiveVar(false);
    this.items = new ReactiveVar([]);

    let fieldSchema = this.data.fieldSchema.get();

    this.autorun(() => {
        if (fieldSchema.subscription) {
            this.subscriptionsReady.set(fieldSchema.subscription(this));
        }
        else {
            this.subscriptionsReady.set(true);
        }
    })

    this.autorun(() => {
        if (!this.data.formContext.skeleSubsReady.get()) {
            return false;
        }
        if (!this.subscriptionsReady.get()) {
            return false;
        }

        this.items.set(fieldSchema.source(this));
        this.sourceSet.set(true);
    });

    this.getValue = () => {

    };

    this.isValid = () => {
        let formContext = this.data.formContext;

        return Skeleform.validate.checkOptions(this.getValue(), fieldSchema, formContext.schema, formContext.item);
    };

    this.setValue = (value) => {

    }
});


Template.skeleformChart.onRendered(function() {
    let fieldSchema = this.data.fieldSchema.get();

    this.autorun(() => {
        if (!this.sourceSet.get()) {
            return false;
        }

        let $field = Skeleform.utils.$getFieldById(this, fieldSchema);
        let chartData = this.items.get();
        let chartOptions = fieldSchema.options(this, chartData) || {};

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart($field[0], {
            type: fieldSchema.chartType(this),
            data: chartData,
            options: chartOptions
        });
    });

    Skeleform.utils.InvokeCallback(this, null, fieldSchema, 'onRendered');
});


Template.skeleformChart.onDestroyed(function() {
    let fields = this.data.formContext.fields;

    fields.removeAt(fields.indexOf(this));
});
