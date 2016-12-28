// resolve name conflict between amsul timepicker (exported as $.fn.pickatime) and
// materialize clockpicker (exported as $.fn.pickatime too);
// the exported function of clockpicker will now be "clockpicker".
$.fn.clockpicker = $.fn.pickatime;
delete $.fn.pickatime;
