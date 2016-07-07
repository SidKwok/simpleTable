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
    var currentPage = 1;
    var allPages = 0;

    /**
    * 加载数据
    * @param {jQuery.el} el
    * @param {Array} data
    * @param {Boolean} panigation
    * @param {Number} cp
    */
    function loadTable (el, data, panigation, cp) {
        var tbody = el.children('tbody');
        var first = 0;
        var end = data.length;
        var domArr = [];
        if (panigation) {
            first = (cp - 1) * 10;
            end = ((data.length - first) > 10) ? (first + 10) : data.length;
        }
        tbody.children().detach();
        for (var i = first; i < end; i++) {
            domArr.push('<tr>')
            $.each(data[i], function (i, e) {
                domArr.push('<td>' + e + '</td>');
            });
            domArr.push('</tr>');
        }
        tbody.append(domArr.join(''));
    }

    /**
    * 分页器
    *
    */
    function loadPanigation (el) {

    }

    $.fn.simpleTable = function(opts) {
        var options = $.extend({}, $.fn.simpleTable.defaults, opts);
        var data = options.data;
        var panigation = options.panigation;
        var $this = $(this);
        if (data.length) {
            $this.wrap('<div class="simpleTable" />');
            $('<input type="text"></input>').insertBefore(this);
            $this.append('<tbody></tbody>');
            loadTable($this, data, panigation, currentPage);
        } else {
            console.log('木有数据');
        }

        if (panigation) {
            var domPan = [];
            allPages = Math.ceil(data.length / 10);

            // init Panigation
            $('<div class="panigation"></div>').insertAfter(this);
            domPan.push('<span><a href="javascript: void(0);" data-stfront>&lt;</a>');
            for (var i = 0; i < allPages; i++) {
                domPan.push('<a href="javascript: void(0);" data-stpage="' + (i + 1) + '">' + (i + 1) + '</a>');
            }
            domPan.push('<a href="javascript: void(0);" data-stback>&gt;</a></span>');
            $this.parent().children('.panigation').append(domPan.join(''));

            // 上一页
            $this.parent().find('[data-stfront]').on('click', function() {
                if (currentPage - 1 > 0) {
                    currentPage -= 1;
                    loadTable($this, data, panigation, currentPage);
                }
                console.log(currentPage);
            });

            // 下一页
            $this.parent().find('[data-stback]').on('click', function() {
                if (currentPage + 1 <= allPages) {
                    currentPage += 1;
                    loadTable($this, data, panigation, currentPage);
                }
                console.log(currentPage);
            });

            // 特定页数
            $this.parent().find('.panigation').on('click', '[data-stpage]', function() {
                currentPage = $(this).attr('data-stpage');
                loadTable($this, data, panigation, currentPage);
                console.log(currentPage);
            });


        } else {
            console.log('木有分页器');
        }
    };

    $.fn.simpleTable.defaults = defaults;
})(jQuery)
