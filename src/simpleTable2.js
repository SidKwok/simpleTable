/**
 * @author Sid Kwok <oceankwok@hotmail.com
 * version: 2.0.0
 * https://github.com/SidKwok/simpleTable
 *
 */

(function ($) {
    // SIMPLETABLE CLASS DEFINITION
    // ======================

    var SimpleTable = function (el, options) {
        this.options = options;
        this.$el = $(el);
        this.$el_ = this.$el.clone();

        this.init();
    };

    SimpleTable.DEFAULTS = {
        panigation: true,
        sort: true,
        search: true,
        data:[],
    };

    SimpleTable.prototype.init = function() {
        this.initTable();
        this.initSearch();
        this.initPagination();
        this.initSort();
    }

    SimpleTable.prototype.initTable = function () {

    }

    $.fn.simpleTable = function(opts) {
        
    };

})(jQuery);
