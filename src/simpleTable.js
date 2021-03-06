/**
 * @author Sid Kwok <oceankwok@hotmail.com>
 * version: 2.1.1
 * https://github.com/SidKwok/simpleTable
 *
 */

(function ($) {

    /**
     * 计算统一之后的值大小
     * @param  {String, Number} o 传入的值
     * @return {Object}   包含标记与值大小
     */
    var calculateObjectValue = function (o) {
        var obj = {
            val: '0',
            isAnyString: false
        };
        var arr = [];
        var strCount = 0;
        if (typeof o === 'number') {
            o += '';
        }

        if (typeof o === 'string') {
            arr = o.split('').filter(function (item, index) {
                if ($.isNumeric(item)) {
                    return true;
                } else {
                    obj.isAnyString = true;
                    return false;
                }
            });

            if (!arr.length) {
                for (var i = 0; i< o.length; i++) {
                    strCount += o.charCodeAt(i);
                }
                obj.val = strCount + '';
                obj.isAnyString = false;
            } else {
                obj.val = arr.join('');
            }
        }

        return obj;
    };

    /**
     * 生成数据
     * @param  {Array} oriData 原始数据
     * @return {Array} 添加了tag之后的数据
     */
    var createData = function (oriData) {
        var data = [];
        $.each(oriData, function (i, e) {
            // 每一列的第一个元素是tag, maybe哈希会更好
            e.unshift(i);
            data.push(e);
        })
        return data;
    };

    /**
     * 排序算法
     * @param  {String, Number} a   数据项
     * @param  {String, Number} b   数据项
     * @param  {Number} col 第几列
     * @param  {String} sortType 排序类型
     * @return {Number} 比较结果
     */
    var sortAlgorithm = function (a, b, col, sortType) {
        var aa = calculateObjectValue(a[col]),
            bb = calculateObjectValue(b[col]),
            length = aa.val.length > bb.val.length ? aa.val.length : bb.val.length,
            gap = 0;

        if (aa.isAnyString || bb.isAnyString) {
            for (var i = 0; i < length; i++) {
                if (parseInt(aa.val[i]) > parseInt(bb.val[i])) {
                    gap = 1;
                    break;
                }
                if (parseInt(aa.val[i]) < parseInt(bb.val[i])) {
                    gap = -1;
                    break;
                }
            }
        } else {
            gap = parseInt(aa.val) - parseInt(bb.val);
        }

        gap = (sortType === 'desc') ? gap : -gap;
        return gap;
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

        this.initTable();
    };

    SimpleTable.DEFAULTS = {
        pagination: true,
        pageOptions: {
            pageItems: 10
        },
        sort: true,
        sortCols: [],
        sortDefaultCol: 0,
        sortIcons: ['fa fa-long-arrow-down', 'fa fa-long-arrow-up'],
        search: true,
        data:[],
    };

    SimpleTable.prototype.initTable = function () {
        var data = createData (this.options.data);
        this.options.data = data;
        this.bufferData = data;

        // 包一层
        this.$el.wrap('<div class="simpleTable" />');
        // 加tbody
        this.$el.append('<tbody></tbody>')

        // 分页
        if (this.options.pagination) {
            this.initPagination();
        } else {
            this.pageData = data;
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
        $('<input type="text" class="stSearch" placeholder="搜索"></input>').insertBefore(this.$el);
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
                '<a href="javascript: void(0);" class="stfront" data-stfront="0">&lt;</a>' +
                    '<span class="pageNumber"></span>' +
                '<a href="javascript: void(0);" class="stback" data-stback="2">&gt;</a>' +
            '</span>');
        this.updatePagination();
        this.updatePageNumber();
        this.onPagination();
    }

    SimpleTable.prototype.updatePagination = function () {

        if (!this.options.pagination) {
            this.pageData = this.bufferData;
            return;
        }

        var data = this.bufferData;
        var pageItems = this.options.pageOptions.pageItems;
        var length = Math.ceil(data.length / pageItems);
        var first = (this.currentPage - 1) * pageItems;
        var end = (this.currentPage === length) ? data.length : (first + pageItems);

        this.pageData = [];

        if (data.length) {
            for (var i = first; i < end; i++) {
                this.pageData.push(data[i]);
            }
        }
    }

    SimpleTable.prototype.updatePageNumber = function () {

        if (!this.options.pagination) {
            return;
        }

        var length = Math.ceil(this.bufferData.length / this.options.pageOptions.pageItems);
        var pagination = this.$el.parent().find('.pagination .pageNumber');
        var domArr = [];
        var cp = this.currentPage;

        pagination.children().detach();

        for (var i = 0; i < length; i++) {
            domArr.push('<a href="javascript: void(0);" ' +
                            'class="' + (cp === (i + 1) ? 'active' : '') +'" ' +
                            'data-stpage="' + (i + 1) + '">' +
                            (i + 1) +
                        '</a>');
        }

        pagination.append(domArr.join(''));
    }

    SimpleTable.prototype.onPagination = function () {
        var pagination = this.$el.parent().find('.pagination');
        var that = this;

        // 上一页
        pagination.find('[data-stfront]').on('click', function () {
            if (that.currentPage > 1) {
                pagination.find('[data-stpage="' + that.currentPage + '"]').removeClass('active');
                that.currentPage -= 1;
                pagination.find('[data-stpage="' + that.currentPage + '"]').addClass('active');
                $(this).attr('data-stfront', that.currentPage - 1);
                pagination.find('[data-stback]').attr('data-stback', that.currentPage + 1);
                that.updatePagination();
                that.updateTable();
            }
        });

        // 下一页
        pagination.find('[data-stback]').on('click', function () {
            var nextPage = parseInt($(this).attr('data-stback'));
            var allPages = Math.ceil(that.bufferData.length / that.options.pageOptions.pageItems);

            if (nextPage <= allPages) {
                pagination.find('[data-stpage="' + that.currentPage + '"]').removeClass('active');
                that.currentPage += 1;
                pagination.find('[data-stpage="' + that.currentPage + '"]').addClass('active');
                pagination.find('[data-stfront]').attr('data-stfront', that.currentPage - 1);
                $(this).attr('data-stback', that.currentPage + 1);
                that.updatePagination();
                that.updateTable();
            }
        });

        // 特定页
        pagination.on('click', '[data-stpage]', function () {
            pagination.find('[data-stpage="' + that.currentPage + '"]').removeClass('active');
            that.currentPage = parseInt($(this).attr('data-stpage'));
            pagination.find('[data-stpage="' + that.currentPage + '"]').addClass('active');
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
        var icons = this.options.sortIcons;
        var iconClass = icons[0].split(' ')[0],
            iconDown = icons[0].split(' ')[1],
            iconUp = icons[1].split(' ')[1];
        var sortCols = this.options.sortCols;
        var sortDefaultCol = this.options.sortDefaultCol;
        var that = this;

        for (var i = 0; i < ths.length; i++) {
            if (sortCols[i] || (typeof sortCols[i]) === 'undefined') {
                $(ths[i]).attr('data-sort', i + 1);
                $(ths[i]).attr('data-sorttype', 'desc');
                $(ths[i]).append('&nbsp<i class="' + icons[0] + '"></i>');
            }
        }
        if (sortDefaultCol) {
            this.bufferData.sort(function (a, b) {
                return sortAlgorithm(a, b, sortDefaultCol, 'asc');
            });
            this.updatePagination();
            this.updateTable();
        }

        thead.on('click', '[data-sort]', function () {
            var col = $(this).attr('data-sort');
            var sortType = $(this).attr('data-sorttype');
            var $this = $(this);

            $this.find('.fa').removeClass((sortType === 'desc') ? iconDown : iconUp);
            $this.attr('data-sorttype', (sortType === 'desc') ? 'asc' : 'desc');
            $this.find('.fa').addClass((sortType === 'desc') ? iconUp : iconDown);

            that.bufferData.sort(function (a, b) {
                return sortAlgorithm(a, b, col, sortType);
            });

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
        var rowid = parseInt(row.attr('data-rowid'));
        var that = this;

        $.each(this.options.data, function(i, e) {
            if (e[0] === rowid) {
                that.options.data.splice(i, 1);
                return false;
            }
        });

        this.updatePagination();
        this.updatePageNumber();
        this.updateTable();
    }

    SimpleTable.prototype.update = function (args) {
        var rowid = parseInt(args[0].attr('data-rowid'))
        var that = this;

        $.each(this.options.data, function (i, e) {
            if (e[0] === rowid) {
                that.options.data[i] = args[1];
                that.options.data[i].unshift(rowid);
                return false;
            }
        });

        this.updatePagination();
        this.updateTable();
    }

    SimpleTable.prototype.reload = function (newData) {
        var data = createData(newData);

        this.options.data = data;
        this.bufferData = data;
        this.updatePagination();
        this.updatePageNumber();
        this.updateTable();
    }

    var allowedMethods = ['append', 'remove', 'update', 'reload'];

    $.fn.simpleTable = function(opt) {
        var args = Array.prototype.slice.call(arguments, 1);
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

                switch (opt) {
                    case 'append':
                        data.append(args[0]);
                        break;
                    case 'remove':
                        data.remove(args[0]);
                        break;
                    case 'update':
                        data.update(args);
                        break;
                    case 'reload':
                        data.reload(args[0]);
                    default:
                        break;
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
