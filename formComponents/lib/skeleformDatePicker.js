// DATE PICKER
// an input field with calendar plugin
// it uses materialize's version of pickaday plugin for more informations: http://materializecss.com/forms.html
// pickaday parameters documentantion: http://amsul.ca/pickadate.js/date/ù
// pickaday api documentation: http://amsul.ca/pickadate.js/api/
// implemented run-time override for reactivity in meteor.js (no hack in materialize' source files)

Template.skeleformDatePicker.helpers(skeleformGeneralHelpers);
Template.skeleformDatePicker.helpers({
    fieldDate: function(data, attribute) {
        if (!data || !data.fetch()[0]) return;
        var template = Template.instance();
        var lang = Session.get('currentLang'); //register language dependency

        if (Session.get('formRendered') && template.pickerStarted.get()) {
            var item = data.fetch()[0];
            console.log('setting reloaded value');
            console.log(moment.locale());
            var loadedDate = moment(item[attribute], "DD/MM/YYYY").format("D MMMM YYYY");
            var picker = template.$('.datepicker').pickadate('picker');

            if (picker) template.$('#' + attribute).val(loadedDate);
        }
    }
});

Template.skeleformDatePicker.rendered = function() {
    var schema = this.data.schema;
    var self = this;
    this.pickerStarted = new ReactiveVar(false);

    //datepicker starter
    var data = self.data.item;
    FlowRouter.subsReady(function() {
        startDatePicker(self, data ? data.fetch()[0] : undefined);
    });

    //change lang strings
    function changeSelects(pickerInstance, pickerElement) {
        console.log('override picker lang');
        var selected = pickerInstance.get('select', 'dd/mm/yyyy');
        var dayOfWeek = moment(selected, 'DD/MM/YYYY').format('d');
        
        //console.log('set: ' + selected);
        if (self.data) skeleformValidateField(selected, self.data);
        
        // OVERRIDE PICKADATE LANGUAGE DEPENDANT'S LABELS WITH REACTIVE TEMPLATES
        var currentDate = {
            day: parseInt(moment().format('D')),
            month: parseInt(moment().format('M')),
            year: parseInt(moment().format('YYYY'))
        };

        if (selected !== "") {
            currentDate.day = parseInt(selected.substr(0, 2));
            currentDate.month = parseInt(selected.substr(3, 2));
            currentDate.year = parseInt(selected.substr(6, 4));
        }

        //console.log(picker);
        // picker's month label
        self.$('.picker__month-display').empty();
        Blaze.renderWithData(Template.pickAdateMonthLabel, {month: currentDate.month}, self.$('.picker__month-display')[0]);
        // picker's footer
        self.$('.picker__footer').empty();
        Blaze.render(Template.pickAdateFooter, self.$('.picker__footer')[0]);
        // picker's day of the week label
        self.$('.picker__weekday-display').empty();
        Blaze.renderWithData(Template.pickAdateDayOfWeekLabel, {dayOfWeek: dayOfWeek}, self.$('.picker__weekday-display')[0]);

        // picker' select option labels
        $.each(self.$('.picker__header').children('.picker__select--month').children('option'), function(index, option) {
            $(option).html(Blaze.renderWithData(Template.pickAdateMonthFull, {monthNumber: index}, option));
        });

        /*var monthsLabels = TAPi18n.__("monthsFull_labels").split(" ");
        var daysOfWeekSingles = TAPi18n.__("weekDaysSingle_labels").split(" ");
            daysOfWeekSingles.move(0, 6);

        //months select
        self.$('.picker__select--month').attr('title', TAPi18n.__("monthSelect_label"));
        self.$('.picker__select--month').children('option').each(function(index, option) {
            $(option).html(monthsLabels[index]);
        });

        //years select
        self.$('.picker__select--year').attr('title', TAPi18n.__("yearSelect_label"));

        //navigation
        self.$('.picker__nav--prev').attr('title', TAPi18n.__("pickadateNav_prev"));
        self.$('.picker__nav--next').attr('title', TAPi18n.__("pickadateNav_next"));

        //days of the week table header
        self.$('.picker__weekday').each(function(index, cell) {
            $(cell).html(daysOfWeekSingles[index]);
        });*/
            
    }
    
    function startDatePicker(self, item) {
        var init = {
            format: 'd mmmm yyyy',
            formatSubmit: 'dd/mm/yyyy',
            hiddenName: true,
            firstDay: 1,
            selectMonths: true,
            selectYears: 10,
            monthsFull: TAPi18n.__("monthsFull_labels").split(" "),
            weekdaysShort: TAPi18n.__("weekDaysShort_labels").split(" "),
            today: TAPi18n.__("pickadateButtons_labels").split(" ")[0],
            clear: TAPi18n.__("pickadateButtons_labels").split(" ")[1],

            onStart: function() {
                self.pickerStarted.set(true);
                setStartDate(schema, item, this);
            },
            onSet: function() {
                var tmp = this;
                changeSelects(tmp, self.$('.datepicker'));
            }
        };

        var $datepicker = self.$('.datepicker').pickadate(init);
    }

    function setStartDate(schema, item, picker) {
        var startDate;

        if (item && item[schema.name]) {
            startDate = item[schema.name];
            var currentDate = {};

            currentDate.day = parseInt(startDate.substr(0, 2));
            currentDate.month = parseInt(startDate.substr(3, 2));
            currentDate.year = parseInt(startDate.substr(6, 4));

            picker.set('select', [currentDate.year, currentDate.month - 1, currentDate.day]);
        }     
        else if (schema.startDate && schema.startDate.year) {
            startDate = schema.startDate;

            if (!startDate.day) startDate.day = 1;
            if (!startDate.month) startDate.month = 1;

            picker.set('select', [startDate.year, startDate.month - 1, startDate.day]);
        }
    }
};


// PICKADATE RUNTIME OVERRIDE LANGUAGE DEPENDANT LABELS
// picker's month label
Template.pickAdateMonthLabel.helpers({
    getShortMonthName: function(number) {
        var months = TAPi18n.__("monthsShort_labels").split(" ");

        return months[number - 1];
    }
});

// picker's footer
Template.pickAdateFooter.helpers({
    buttonLabels: function(number) {
        var labels = TAPi18n.__("pickadateButtons_labels").split(" ");

        return labels[number];
    }
});

// picker's day of the week label
Template.pickAdateDayOfWeekLabel.helpers({
    dayLabel: function(number) {
        var days = TAPi18n.__("weekDaysFull_labels").split(" ");

        return days[number];
    }
});

// picker's month full labels
Template.pickAdateMonthFull.helpers({
    monthFull: function(number) {
        var months = TAPi18n.__('monthsFull_labels').split(" ");

        return months[number];
    }
});
