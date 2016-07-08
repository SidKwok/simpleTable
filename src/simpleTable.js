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
    var originalData = [];
    var searchData = [];

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
    * @param {jQuery.el} el
    * @param {Array} data
    * @param {Boolean} panigation
    * @param {Number} ap
    */
    function loadPanigation (el, data, panigation, ap) {
        var domPan = [];

        el.parent().find('.panigation').children().detach();

        domPan.push('<span><a href="javascript: void(0);" data-stfront>&lt;</a>');
        for (var i = 0; i < ap; i++) {
            domPan.push('<a href="javascript: void(0);" data-stpage="' + (i + 1) + '">' + (i + 1) + '</a>');
        }
        domPan.push('<a href="javascript: void(0);" data-stback>&gt;</a></span>');
        el.parent().children('.panigation').append(domPan.join(''));

        // 取消绑定事件
        el.parent().find('.panigation').off('click');

        // 上一页
        el.parent().find('[data-stfront]').on('click', function() {
            if (currentPage - 1 > 0) {
                currentPage -= 1;
                loadTable(el, data, panigation, currentPage);
            }
        });

        // 下一页
        el.parent().find('[data-stback]').on('click', function() {
            if (currentPage + 1 <= ap) {
                currentPage += 1;
                loadTable(el, data, panigation, currentPage);
            }
        });

        // 特定页数
        el.parent().find('.panigation').on('click', '[data-stpage]', function() {
            currentPage = $(this).attr('data-stpage');
            loadTable(el, data, panigation, currentPage);
        });
    }

    /**
    * 排序器
    * @param {jQuery.el} el
    * @param {Array} data
    * TODO
    */
    function loadSorter (el, data, panigation) {
        // 取消事件绑定
        el.parent().find('thead').off('click');

        el.parent().find('thead').on('click', '[data-sort]', function() {
            var col = $(this).attr('data-sort');
            var sortType = $(this).attr('data-sorttype');
            if (sortType === 'desc') {
                data.sort(function(a, b) {
                    var gap = 0;
                    if (typeof parseFloat(a[col - 1]) === 'number' && typeof parseFloat(b[col - 1]) === 'number') {
                        gap = parseFloat(b[col - 1]) - parseFloat(a[col - 1]);
                    }
                    return gap;
                });
                $(this).attr('data-sorttype', 'asc');
            } else {
                data.sort(function(a, b) {
                    var gap = 0;
                    if (typeof parseFloat(a[col - 1]) === 'number' && typeof parseFloat(b[col - 1]) === 'number') {
                        gap = parseFloat(a[col - 1]) - parseFloat(b[col - 1]);
                    }
                    return gap;
                });
                $(this).attr('data-sorttype', 'desc');
            }
            loadTable(el, data, panigation, 1);
            loadPanigation(el, data, panigation, allPages);
        });
    }

    $.fn.simpleTable = function(opts) {
        var $this = $(this);

        if (typeof opts === 'object') {
            var options = $.extend({}, $.fn.simpleTable.defaults, opts);
            originalData = options.data;
            var panigation = options.panigation;
            var sort = options.sort;
            var search = options.search;

            if (originalData.length) {
                $this.wrap('<div class="simpleTable" />');
                $this.append('<tbody></tbody>');
                loadTable($this, originalData, panigation, currentPage);
            } else {
                console.log('木有数据');
            }

            // 分页
            if (panigation) {
                allPages = Math.ceil(originalData.length / 10);

                // init Panigation
                $('<div class="panigation"></div>').insertAfter(this);
                loadPanigation($this, originalData, panigation, allPages);
            } else {
                console.log('木有分页器');
            }

            // 排序
            if (sort) {
                $this.find('th').each(function(i, e) {
                    $(this).attr('data-sort', i + 1);
                    $(this).attr('data-sorttype', 'desc');
                });

                loadSorter($this, originalData, panigation);
            } else {
                console.log('木有指定排序');
            }

            // 搜索
            if (search) {
                $('<input type="text"></input>').insertBefore(this);

                $this.parent().find('input').on('keyup', function() {
                    var str = $(this).val();
                    searchData = [];
                    if (str) {
                        $.each(originalData, function (index, arr) {
                            $.each(arr, function (i, e) {
                                if (('' + e).toLowerCase().indexOf(str) !== -1) {
                                    searchData.push(arr);
                                    return false;
                                }
                            });
                        });
                        currentPage = 1;
                        loadTable($this, searchData, panigation, currentPage);

                        var ap = Math.ceil(searchData.length / 10);
                        loadPanigation($this, searchData, panigation, ap);
                    } else {
                        loadTable($this, originalData, panigation, currentPage);
                        loadPanigation($this, originalData, panigation, allPages);
                    }
                });
            } else {
                console.log('木有搜索');
            }
        } else {
            if (opts === 'append') {
                var row = arguments[1];
                originalData.push(row);
                loadTable($this, originalData, panigation, currentPage);
            }

            if (opts === 'remove') {

            }
        }
    };

    $.fn.simpleTable.defaults = defaults;

    $.fn.simpleTable.prototype.del = function () {
        console.log('test');
    }
})(jQuery)