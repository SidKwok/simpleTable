/**
 * @author Sid Kwok <oceankwok@hotmail.com
 * version: 1.0.0
 * https://github.com/SidKwok/simpleTable
 */

(function($){
    var defaults = {
        panigation: true,
        sort: true,
        search: true,
        data:[]
    };
    var currentPage = 0;

    /**
    * @param {jQuery.el} el
    * @param {Array} data
    * @param {Boolean} panigation
    * @param {Number} cp
    */
    function loadTable (el, data, panigation, cp) {
        var tbody = $(el).children('tbody');
        var length = (panigation ? 10 : data.length) - (panigation ? cp : 0) * 10;
        var domArr = [];

        tbody.children().detach();

        for (var i = cp * 10; i < length; i++) {
            domArr.push('<tr>')
            $.each(data[i], function (i, e) {
                domArr.push('<td>' + e + '</td>');
            });
            domArr.push('</tr>');
        }
        tbody.append(domArr.join(''));
    }

    $.fn.simpleTable = function(opts) {
        var options = $.extend({}, $.fn.simpleTable.defaults, opts);

        if (options.data.length) {
            $(this).append('<tbody></tbody>');
            loadTable(this, options.data, options.panigation);
        } else {
            console.log('木有数据');
        }

        if (options.panigation) {

        } else {

        }
    };

    $.fn.simpleTable.defaults = defaults;
})(jQuery)
