/**
 * @author Sid Kwok <oceankwok@hotmail.com
 * version: 2.0.0
 * https://github.com/SidKwok/simpleTable
 *
 */

(function ($) {

    var appendRow = function (tbody, data) {
        tbody.children().detach();
        var domArr = [];
        $.each(data, function (index, arr) {
            domArr.push('<tr data-rowid="' + arr[0] + '">')
            for (var i = 1; i < arr.length; i++) {
                domArr.push('<td>' + arr[i] + '</td>');
            }
            domArr.push('</tr>');
        });
        tbody.append(domArr.join(''));
    }

    // SIMPLETABLE CLASS DEFINITION
    // ======================

    var SimpleTable = function (el, options) {
        this.options = options;
        this.$el = $(el);
        this.$el_ = this.$el.clone();
        this.bufferData = [];
        this.pageData = [];
        this.currentPage = 1;

        this.init();
    };

    SimpleTable.DEFAULTS = {
        pagination: true,
        sort: true,
        search: true,
        data:[],
    };

    SimpleTable.prototype.init = function () {
        this.initData();
        this.initTable();
        // this.initSearch();
        // this.initPagination();
        // this.initSort();
    }

    SimpleTable.prototype.initData = function (data, type) {
        // if (type === 'append') {
        //     this.options.data = this.options.data.concat(data);
        // } else {
        //     this.options.data = this.data;
        // }
        // console.log('initData');
    }

    SimpleTable.prototype.initTable = function () {
        var data = [];
        var oriData = this.options.data;
        $.each(oriData, function (i, e) {
            // 每一列的第一个元素是tag, maybe哈希会更好
            e.unshift(i);
            data.push(e);
        })
        this.options.data = data;
        this.bufferData = data;

        // 包一层
        this.$el.wrap('<div class="simpleTable" />');
        // 加tbody
        this.$el.append('<tbody></tbody>')

        this.updateTable('init');

        // 分页
        if (this.options.pagination) {
            this.initPagination();
        }

        // 搜索
        if (this.options.search) {
            this.initSearch();
        }

        // 排序
        if (this.options.sort) {
            this.initSort();
        }

        this.updateTable();
    }

    SimpleTable.prototype.updateTable = function () {
        appendRow(this.$el.find('tbody'), this.pageData);
    }

    SimpleTable.prototype.initSearch = function () {
        var that = this;
        var tbody = that.$el.find('tbody');
        $('<input type="text"></input>').insertBefore(this.$el);
        that.$el.parent().find('input').on('keyup', function () {
            var str = $(this).val();
            that.bufferData = [];
            $.each(that.options.data, function (index, arr) {
                for (var i = 1; i < arr.length; i++) {
                    if (('' + arr[i]).toLowerCase().indexOf(str) >= 0) {
                        that.bufferData.push(arr);
                        break;
                    }
                }
            });
            that.updatePagination();
            that.updateTable();
        });
    }

    SimpleTable.prototype.initPagination = function () {
        $('<div class="pagination"></div>').insertAfter(this.$el);
        this.updatePagination();
    }

    SimpleTable.prototype.updatePagination = function () {
        var data = this.bufferData;
        var pagination = this.$el.parent().find('.pagination');
        var length = Math.ceil(data.length / 10);
        var first = (this.currentPage - 1) * 10;
        var end = (this.currentPage === length) ? (data.length - first) : (first + 10);
        var domArr = [];
        var that = this;

        that.pageData = [];
        pagination.children().detach();
        pagination.off('click');

        domArr.push('<span><a href="javascript: void(0);" data-stfront="1">&lt;</a>');
        for (var i = 0; i < length; i++) {
            domArr.push('<a href="javascript: void(0);" data-stpage="' + (i + 1) + '">' + (i + 1) + '</a>');
        }
        domArr.push('<a href="javascript: void(0);" data-stback="3">&gt;</a></span>');
        pagination.append(domArr.join(''));

        for (var i = first; i < end; i++) {
            that.pageData.push(data[i]);
        }

        // // 上一页
        // pagination.find('[data-stfront]').on('click', function() {
        //     var first = 0;
        //     var end = 0;
        //     that.pageData = [];
        //     var currentPage = $(this).attr('data-stfront');
        //
        //     if (currentPage > 0) {
        //         $(this).attr('data-stfront', currentPage - 1);
        //         first = (currentPage - 1) * 10;
        //         end = ((data.length - first) > 10) ? (first + 10) : data.length;
        //
        //         for (var i = first; i < end; i++) {
        //             that.pageData.push(data[i]);
        //         }
        //         appendRow(that.$el.find('tbody'), that.pageData);
        //     }
        // });

        // // 下一页
        // pagination.find('[data-stback]').on('click', function() {
        //     var first = 0;
        //     var end = 0;
        //     that.pageData = [];
        //     var currentPage = $(this).attr('data-stback');
        //
        //     if (currentPage <= data.length) {
        //         $(this).attr('data-stback', currentPage + 1);
        //         first = (currentPage - 1) * 10;
        //         end = ((data.length - first) > 10) ? (first + 10) : data.length;
        //
        //         for (var i = first; i < end; i++) {
        //             that.pageData.push(data[i]);
        //         }
        //         appendRow(that.$el.find('tbody'), that.pageData);
        //     }
        // });

        // 特定页数
        // pagination.on('click', '[data-stpage]', function() {
        //     var first = 0;
        //     var end = 0;
        //     that.pageData = [];
        //     var currentPage = $(this).attr('data-stback');
        //
        //     if (currentPage <= data.length) {
        //         $(this).attr('data-stback', currentPage + 1);
        //         first = (currentPage - 1) * 10;
        //         end = ((data.length - first) > 10) ? (first + 10) : data.length;
        //
        //         for (var i = first; i < end; i++) {
        //             that.pageData.push(data[i]);
        //         }
        //         appendRow(that.$el.find('tbody'), that.pageData);
        //     }
        // });
    }

    SimpleTable.prototype.onPagination = function () {
        // TODO
    }

    SimpleTable.prototype.initSort = function () {
        var thead = this.$el.find('thead');
        var ths = thead.find('th');
        var data = this.options.data;
        var that = this;

        ths.each(function (i, e) {
            $(this).attr('data-sort', i + 1);
            $(this).attr('data-sorttype', 'desc');
        });

        thead.on('click', '[data-sort]', function () {
            var col = $(this).attr('data-sort');
            var sortType = $(this).attr('data-sorttype');
            if (sortType === 'desc') {
                data.sort(function(a, b) {
                    var gap = 0;
                    if (typeof parseFloat(a[col]) === 'number' && typeof parseFloat(b[col]) === 'number') {
                        gap = parseFloat(b[col]) - parseFloat(a[col]);
                    }
                    return gap;
                });
                $(this).attr('data-sorttype', 'asc');
            } else {
                data.sort(function(a, b) {
                    var gap = 0;
                    if (typeof parseFloat(a[col]) === 'number' && typeof parseFloat(b[col]) === 'number') {
                        gap = parseFloat(a[col]) - parseFloat(b[col]);
                    }
                    return gap;
                });
                $(this).attr('data-sorttype', 'desc');
            }
            that.updateTable('sort');
        });
    }

    var allowedMethods = ['append', 'remove'];

    $.fn.simpleTable = function(opt) {
        var options = $.extend({}, SimpleTable.DEFAULTS, options);
        this.each(function () {
            var $this = $(this),
                data = $this.data('simpleTable'),
                options = $.extend({}, SimpleTable.DEFAULTS, $this.data(),
                    typeof opt === 'object' && opt);
            if (opt === 'string') {
                var row = arguments[1];
                if ($.inArray(opt, allowedMethods) < 0) {
                    throw new Error('Unknow method: ' + opt);
                }

                if (!data) {
                    return;
                }
            }

            if (!data) {
                $this.data('simpleTable', (data = new SimpleTable(this, options)));
            }

            console.log(data);
        });
    };

    $.fn.simpleTable.Constructor = SimpleTable;
    $.fn.simpleTable.defaults = SimpleTable.DEFAULTS;
    $.fn.simpleTable.methods = allowedMethods;

})(jQuery);
