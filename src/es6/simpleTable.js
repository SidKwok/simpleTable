/**
 * @author Sid Kwok <oceankwok@hotmail.com>
 * it's for my es6 trial
 * version: 2.1.0
 * https://github.com/SidKwok/simpleTable
 */

(($) => {
    /**
     * 计算统一之后的值大小
     * @param  {String, Number} o 传入的值
     * @return {Object}   包含标记与值大小
     */
    let calculateObjectValue = function (o) {
        let obj = {
            val: '0',
            isAnyString: false
        };
        let arr = [];
        let strCount = 0;
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
                for (let i = 0; i < o.length; i++) {
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
    let createData = function (oriData) {
        let data = [];
        $.each(oriData, (i, e) => {
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
     let sortAlgorithm = function (a, b, col, sortType) {
         let aa = calculateObjectValue(a[col]),
             bb = calculateObjectValue(b[col]),
             length = aa.val.length > bb.val.length ? aa.val.length : bb.val.length,
             gap = 0;

         if (aa.isAnyString || bb.isAnyString) {
             for (let i = 0; i < length; i++) {
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

    class SimpleTable {
        constructor (el, options) {
            this.options = options;
            this.$el = $(el);
            this.$el_ = this.$el.clone();
            this.bufferData = [];
            this.pageData = [];
            this.currentPage = 1;

            this.initTable();
        }

        initTable() {
            let data = createData (this.options.data);
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

        updateTable() {
            let tbody = this.$el.find('tbody');
            let data = this.pageData;
            let domArr = [];

            tbody.children().detach();

            if (data.length) {
                for (let arr of data) {
                    domArr.push('<tr data-rowid="' + arr[0] + '">')
                    for (var i = 1; i < arr.length; i++) {
                        domArr.push('<td>' + arr[i] + '</td>');
                    }
                    domArr.push('</tr>');
                }
            }

            tbody.append(domArr.join(''));
        }

        initSearch() {
            let that = this;
            let tbody = that.$el.find('tbody');
            $('<input type="text" class="stSearch" placeholder="搜索"></input>').insertBefore(this.$el);
            that.$el.parent().find('input').on('keyup', function () {
                var str = $(this).val();
                that.bufferData = [];
                for (let arr of that.options.data) {
                    for (let i = 1; i < arr.length; i++) {
                        if (('' + arr[i]).toLowerCase().indexOf(str) >= 0) {
                            that.bufferData.push(arr);
                            break;
                        }
                    }
                }

                that.updatePagination();
                that.updatePageNumber();
                that.updateTable();
            });
        }

        initPagination() {
            $('<div class="pagination"></div>').insertAfter(this.$el);
            this.$el.parent().find('.pagination').append(`
                <span>
                    <a href="javascript: void(0);" class="stfront" data-stfront="0">&lt;</a><span class="pageNumber"></span><a href="javascript: void(0);" class="stback" data-stback="2">&gt;</a>
                </span>
                `);
            this.updatePagination();
            this.updatePageNumber();
            this.onPagination();
        }

        updatePagination() {
            if (!this.options.pagination) {
                this.pageData = this.bufferData;
                return;
            }

            let data = this.bufferData;
            let pageItems = this.options.pageOptions.pageItems;
            let length = Math.ceil(data.length / pageItems);
            let first = (this.currentPage - 1) * pageItems;
            let end = (this.currentPage === length) ? data.length : (first + pageItems);

            this.pageData = [];

            if (data.length) {
                for (let i = first; i < end; i++) {
                    this.pageData.push(data[i]);
                }
            }
        }

        updatePageNumber() {
            if (!this.options.pagination) {
                return;
            }

            let length = Math.ceil(this.bufferData.length / this.options.pageOptions.pageItems);
            let pagination = this.$el.parent().find('.pagination .pageNumber');
            let domArr = [];
            let cp = this.currentPage;

            pagination.children().detach();

            for (let i = 0; i < length; i++) {
                domArr.push(`<a href="javascript: void(0);" class="${(cp === (i + 1) ? 'active' : '')}" data-stpage="${i + 1}">${i + 1}</a>`);

            }

            pagination.append(domArr.join(''));
        }

        onPagination() {
            let pagination = this.$el.parent().find('.pagination');
            let that = this;

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
                let nextPage = parseInt($(this).attr('data-stback'));
                let allPages = Math.ceil(that.bufferData.length / that.options.pageOptions.pageItems);

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

        initSort() {
            let thead = this.$el.find('thead');
            let ths = thead.find('th');
            let { data, sortIcons, sortCols, sortDefaultCol } = this.options;
            let iconClass = sortIcons[0].split(' ')[0],
                iconDown = sortIcons[0].split(' ')[1],
                iconUp = sortIcons[1].split(' ')[1];
            let that = this;
            for (let i = 0; i < ths.length; i++) {
                if (sortCols[i] || (typeof sortCols[i]) === 'undefined') {
                    $(ths[i]).attr('data-sort', i + 1);
                    $(ths[i]).attr('data-sorttype', 'desc');
                    $(ths[i]).append('&nbsp<i class="' + sortIcons[0] + '"></i>');
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
                let col = $(this).attr('data-sort');
                let sortType = $(this).attr('data-sorttype');
                let $this = $(this);

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

        append (row) {
            row.unshift(this.options.data.length);
            this.options.data.unshift(row);

            this.updatePagination();
            this.updatePageNumber();
            this.updateTable();
        }

        remove (row) {
            let rowid = parseInt(row.attr('data-rowid'));

            $.each(this.options.data, (i, e) => {
                if (e[0] === rowid) {
                    this.options.data.splice(i, 1);
                    return false;
                }
            });

            this.updatePagination();
            this.updatePageNumber();
            this.updateTable();
        }

        update (args) {
            let rowid = parseInt(args[0].attr('data-rowid'));

            $.each(this.options.data, (i, e) => {
                if (e[0] === rowid) {
                    this.options.data[i] = args[1];
                    this.options.data[i].unshift(rowid);
                    return false;
                }
            });

            this.updatePagination();
            this.updateTable();
        }

        reload (newData) {
            let data = createData(newData);

            this.options.data = data;
            this.bufferData = data;
            this.updatePagination();
            this.updatePageNumber();
            this.updateTable();
        }
    }

    SimpleTable.DEFAULTS = {
        pagination: true,
        sort: true,
        search: true,
        data:[],
        pageOptions: {
            pageItems: 10
        },
        sortCols: [],
        sortIcons: ['fa fa-long-arrow-down', 'fa fa-long-arrow-up'],
        sortDefaultCol: 0,
    };

    const allowedMethods = ['append', 'remove', 'update', 'reload'];

    $.fn.simpleTable = function(...args) {
        this.each(() => {
            let $this = $(this),
                data = $this.data('simpleTable'),
                options = $.extend({}, SimpleTable.DEFAULTS, $this.data(),
                    typeof args[0] === 'object' && args[0]);
            if (typeof args[0] === 'string') {
                if ($.inArray(args[0], allowedMethods) < 0) {
                    throw new Error('Unknow method: ' + args[0]);
                }

                if (!data) {
                    return;
                }

                switch (args[0]) {
                    case 'append':
                        data.append(args[1]);
                        break;
                    case 'remove':
                        data.remove(args[1]);
                        break;
                    case 'update':
                        args.shift();
                        data.update(args);
                        break;
                    case 'reload':
                        data.reload(args[1]);
                    default:
                        break;
                }
            }
            if (!data) {
                $this.data('simpleTable', (data = new SimpleTable(this, options)));
            }
        });
    };
})(jQuery);
