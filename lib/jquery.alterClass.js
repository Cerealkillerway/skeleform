(function($) {   
    $.fn.alterClass = function (removals, additions) {        
        var self = this;
        
        if (removals.indexOf('*') === -1) {
            // Use native jQuery methods if there is no wildcard matching
            self.removeClass(removals);
            return !additions ? self : self.addClass( additions );
        }
     
        var patt = new RegExp('\\s' + 
                removals.
                    replace(/\*/g, '[A-Za-z0-9-_]+').
                    split(' ').
                    join('\\s|\\s') + 
                '\\s', 'g');
     
        self.each(function (i, it) {
            var cn = ' ' + it.className + ' ';
            while (patt.test(cn)) {
                cn = cn.replace(patt, ' ');
            }
            it.className = $.trim(cn);
        });
     
        return !additions ? self : self.addClass(additions);
    };
})(jQuery);
