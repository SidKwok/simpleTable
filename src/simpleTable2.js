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
        this.initTable();
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
        var tbody = this.$el.find('tbody');
        var data = this.pageData;
        var domArr = [];

        tbody.children().detach();

        if (data.length) {
            $.each(data, function (index, arr) {
                domArr.push('<tr data-rowid="' + arr[0] + '">')
                for (var i = 1; i < arr.length; i++) {
                    domArr.push('<td>' + arr[i] + '</td>');
                }
                domArr.push('</tr>');
            });
        }

        tbody.append(domArr.join(''));
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
            that.updatePageNumber();
            that.updateTable();
        });
    }

    SimpleTable.prototype.initPagination = function () {
        $('<div class="pagination"></div>').insertAfter(this.$el);
        this.$el.parent().find('.pagination').append(
            '<span>' +
                '<a href="javascript: void(0);" data-stfront="0">&lt;</a>' +
                    '<span class="pageNumber"></span>' +
                '<a href="javascript: void(0);" data-stback="2">&gt;</a>' +
            '</span>');
        this.updatePagination();
        this.updatePageNumber();
        this.onPagination();
    }

    SimpleTable.prototype.updatePagination = function () {
        var data = this.bufferData;
        var length = Math.ceil(data.length / 10);
        var first = (this.currentPage - 1) * 10;
        var end = (this.currentPage === length) ? data.length : (first + 10);
        var that = this;

        that.pageData = [];

        if (data.length) {
            for (var i = first; i < end; i++) {
                that.pageData.push(data[i]);
            }
        }
    }

    SimpleTable.prototype.updatePageNumber = function () {
        var length = Math.ceil(this.bufferData.length / 10);
        var pagination = this.$el.parent().find('.pagination .pageNumber');
        var domArr = [];

        pagination.children().detach();

        for (var i = 0; i < length; i++) {
            domArr.push('<a href="javascript: void(0);" data-stpage="' + (i + 1) + '">' + (i + 1) + '</a>');
        }

        pagination.append(domArr.join(''));
    }

    SimpleTable.prototype.onPagination = function () {
        var pagination = this.$el.parent().find('.pagination');
        var that = this;

        // 上一页
        pagination.find('[data-stfront]').on('click', function () {
            if (that.currentPage > 1) {
                that.currentPage -= 1;
                $(this).attr('data-stfront', that.currentPage - 1);
                pagination.find('[data-stback]').attr('data-stback', that.currentPage + 1);
                that.updatePagination();
                that.updateTable();
            }
        });

        // 下一页
        pagination.find('[data-stback]').on('click', function () {
            var nextPage = parseInt($(this).attr('data-stback'));
            var allPages = Math.ceil(that.bufferData.length / 10);
            if (nextPage <= allPages) {
                that.currentPage += 1;
                pagination.find('[data-stfront]').attr('data-stfront', that.currentPage - 1);
                $(this).attr('data-stback', that.currentPage + 1);
                that.updatePagination();
                that.updateTable();
            }
        });

        // 特定页
        pagination.on('click', '[data-stpage]', function () {
            that.currentPage = parseInt($(this).attr('data-stpage'));
            pagination.find('[data-stfront]').attr('data-stfront', that.currentPage - 1);
            pagination.find('[data-stback]').attr('data-stfront', that.currentPage + 1);
            that.updatePagination();
            that.updateTable();
        })
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
                that.bufferData.sort(function(a, b) {
                    var gap = 0;
                    if (typeof parseFloat(a[col]) === 'number' && typeof parseFloat(b[col]) === 'number') {
                        gap = parseFloat(b[col]) - parseFloat(a[col]);
                    }
                    return gap;
                });
                $(this).attr('data-sorttype', 'asc');
            } else {
                that.bufferData.sort(function(a, b) {
                    var gap = 0;
                    if (typeof parseFloat(a[col]) === 'number' && typeof parseFloat(b[col]) === 'number') {
                        gap = parseFloat(a[col]) - parseFloat(b[col]);
                    }
                    return gap;
                });
                $(this).attr('data-sorttype', 'desc');
            }
            that.updatePagination();
            that.updateTable();
        });
    }

    SimpleTable.prototype.append = function (row) {
        row.unshift(this.options.data.length);
        this.options.data.unshift(row);
        this.updatePagination();
        this.updatePageNumber();
        this.updateTable();
    }

    SimpleTable.prototype.remove = function (row) {
        // TODO
        console.log('remove');
    }

    var allowedMethods = ['append', 'remove'];

    $.fn.simpleTable = function(opt) {
        var options = $.extend({}, SimpleTable.DEFAULTS, options),
            arg = arguments[1];
        this.each(function () {
            var $this = $(this),
                data = $this.data('simpleTable'),
                options = $.extend({}, SimpleTable.DEFAULTS, $this.data(),
                    typeof opt === 'object' && opt);
            if (typeof opt === 'string') {
                if ($.inArray(opt, allowedMethods) < 0) {
                    throw new Error('Unknow method: ' + opt);
                }

                if (!data) {
                    return;
                }

                if (opt === 'append') {
                    data.append(arg);
                }
                if (opt === 'remove') {
                    data.remove(arg);
                }
            }
            if (!data) {
                $this.data('simpleTable', (data = new SimpleTable(this, options)));
            }
        });
    };

    $.fn.simpleTable.Constructor = SimpleTable;
    $.fn.simpleTable.defaults = SimpleTable.DEFAULTS;
    $.fn.simpleTable.methods = allowedMethods;

})(jQuery);
