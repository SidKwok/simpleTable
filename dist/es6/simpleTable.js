'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @author Sid Kwok <oceankwok@hotmail.com>
 * it's for my es6 trial
 * version: 2.1.0
 * https://github.com/SidKwok/simpleTable
 */

(function ($) {

    var calculateObjectValue = function calculateObjectValue(o) {
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
                for (var i = 0; i < o.length; i++) {
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

    var createData = function createData(oriData) {
        var data = [];
        $.each(oriData, function (i, e) {
            e.unshift(i);
            data.push(e);
        });
        return data;
    };

    // SIMPLETABLE CLASS DEFINITION
    // ======================

    var SimpleTable = function () {
        function SimpleTable(el, options) {
            _classCallCheck(this, SimpleTable);

            this.options = options;
            this.$el = $(el);
            this.$el_ = this.$el.clone();
            this.bufferData = [];
            this.pageData = [];
            this.currentPage = 1;

            this.initTable();
        }

        _createClass(SimpleTable, [{
            key: 'initTable',
            value: function initTable() {
                var data = createData(this.options.data);
                this.options.data = data;
                this.bufferData = data;

                // 包一层
                this.$el.wrap('<div class="simpleTable" />');
                // 加tbody
                this.$el.append('<tbody></tbody>');

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
        }, {
            key: 'updateTable',
            value: function updateTable() {
                var tbody = this.$el.find('tbody');
                var data = this.pageData;
                var domArr = [];

                tbody.children().detach();

                if (data.length) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var arr = _step.value;

                            domArr.push('<tr data-rowid="' + arr[0] + '">');
                            for (var i = 1; i < arr.length; i++) {
                                domArr.push('<td>' + arr[i] + '</td>');
                            }
                            domArr.push('</tr>');
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }

                tbody.append(domArr.join(''));
            }
        }, {
            key: 'initSearch',
            value: function initSearch() {
                var that = this;
                var tbody = that.$el.find('tbody');
                $('<input type="text" class="stSearch" placeholder="搜索"></input>').insertBefore(this.$el);
                that.$el.parent().find('input').on('keyup', function () {
                    var str = $(this).val();
                    that.bufferData = [];
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = that.options.data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var arr = _step2.value;

                            for (var i = 1; i < arr.length; i++) {
                                if (('' + arr[i]).toLowerCase().indexOf(str) >= 0) {
                                    that.bufferData.push(arr);
                                    break;
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    that.updatePagination();
                    that.updatePageNumber();
                    that.updateTable();
                });
            }
        }, {
            key: 'initPagination',
            value: function initPagination() {
                $('<div class="pagination"></div>').insertAfter(this.$el);
                this.$el.parent().find('.pagination').append('\n                <span>\n                    <a href="javascript: void(0);" class="stfront" data-stfront="0">&lt;</a><span class="pageNumber"></span><a href="javascript: void(0);" class="stback" data-stback="2">&gt;</a>\n                </span>\n                ');
                this.updatePagination();
                this.updatePageNumber();
                this.onPagination();
            }
        }, {
            key: 'updatePagination',
            value: function updatePagination() {
                if (!this.options.pagination) {
                    this.pageData = this.bufferData;
                    return;
                }

                var data = this.bufferData;
                var pageItems = this.options.pageOptions.pageItems;
                var length = Math.ceil(data.length / pageItems);
                var first = (this.currentPage - 1) * pageItems;
                var end = this.currentPage === length ? data.length : first + pageItems;

                this.pageData = [];

                if (data.length) {
                    for (var i = first; i < end; i++) {
                        this.pageData.push(data[i]);
                    }
                }
            }
        }, {
            key: 'updatePageNumber',
            value: function updatePageNumber() {
                if (!this.options.pagination) {
                    return;
                }

                var length = Math.ceil(this.bufferData.length / this.options.pageOptions.pageItems);
                var pagination = this.$el.parent().find('.pagination .pageNumber');
                var domArr = [];
                var cp = this.currentPage;

                pagination.children().detach();

                for (var i = 0; i < length; i++) {
                    // domArr.push('<a href="javascript: void(0);" ' +
                    //                 'class="' + (cp === (i + 1) ? 'active' : '') +'" ' +
                    //                 'data-stpage="' + (i + 1) + '">' +
                    //                 (i + 1) +
                    //             '</a>');
                    domArr.push('<a href="javascript: void(0);" class="' + (cp === i + 1 ? 'active' : '') + '" data-stpage="' + (i + 1) + '">' + (i + 1) + '</a>');
                }

                pagination.append(domArr.join(''));
            }
        }, {
            key: 'onPagination',
            value: function onPagination() {
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
                });
            }
        }, {
            key: 'initSort',
            value: function initSort() {
                var thead = this.$el.find('thead');
                var ths = thead.find('th');
                var data = this.options.data;
                var icons = this.options.sortIcons;
                var iconClass = icons[0].split(' ')[0],
                    iconDown = icons[0].split(' ')[1],
                    iconUp = icons[1].split(' ')[1];
                var sortRows = this.options.sortRows;
                var that = this;

                for (var i = 0; i < ths.length; i++) {
                    if (sortRows[i] || typeof sortRows[i] === 'undefined') {
                        $(ths[i]).attr('data-sort', i + 1);
                        $(ths[i]).attr('data-sorttype', 'desc');
                        $(ths[i]).append('&nbsp<i class="' + icons[0] + '"></i>');
                    }
                }

                thead.on('click', '[data-sort]', function () {
                    var col = $(this).attr('data-sort');
                    var sortType = $(this).attr('data-sorttype');
                    var $this = $(this);

                    $this.find('.fa').removeClass(sortType === 'desc' ? iconDown : iconUp);
                    $this.attr('data-sorttype', sortType === 'desc' ? 'asc' : 'desc');
                    $this.find('.fa').addClass(sortType === 'desc' ? iconUp : iconDown);

                    that.bufferData.sort(function (a, b) {
                        var aa = calculateObjectValue(a[col]),
                            bb = calculateObjectValue(b[col]),
                            length = aa.val.length > bb.val.length ? aa.val.length : bb.val.length,
                            gap = 0;

                        if (aa.isAnyString || bb.isAnyString) {
                            for (var _i = 0; _i < length; _i++) {
                                if (parseInt(aa.val[_i]) > parseInt(bb.val[_i])) {
                                    gap = 1;
                                    break;
                                }
                                if (parseInt(aa.val[_i]) < parseInt(bb.val[_i])) {
                                    gap = -1;
                                    break;
                                }
                            }
                        } else {
                            gap = parseInt(aa.val) - parseInt(bb.val);
                        }

                        gap = sortType === 'desc' ? gap : -gap;
                        return gap;
                    });

                    that.updatePagination();
                    that.updateTable();
                });
            }
        }, {
            key: 'append',
            value: function append(row) {
                row.unshift(this.options.data.length);
                this.options.data.unshift(row);

                this.updatePagination();
                this.updatePageNumber();
                this.updateTable();
            }
        }, {
            key: 'remove',
            value: function remove(row) {
                var _this = this;

                var rowid = parseInt(row.attr('data-rowid'));

                $.each(this.options.data, function (i, e) {
                    if (e[0] === rowid) {
                        _this.options.data.splice(i, 1);
                        return false;
                    }
                });

                this.updatePagination();
                this.updatePageNumber();
                this.updateTable();
            }
        }, {
            key: 'update',
            value: function update(args) {
                var _this2 = this;

                var rowid = parseInt(args[0].attr('data-rowid'));

                $.each(this.options.data, function (i, e) {
                    if (e[0] === rowid) {
                        _this2.options.data[i] = args[1];
                        _this2.options.data[i].unshift(rowid);
                        return false;
                    }
                });

                this.updatePagination();
                this.updateTable();
            }
        }, {
            key: 'reload',
            value: function reload(newData) {
                var data = createData(newData);

                this.options.data = data;
                this.bufferData = data;
                this.updatePagination();
                this.updatePageNumber();
                this.updateTable();
            }
        }]);

        return SimpleTable;
    }();

    SimpleTable.DEFAULTS = {
        pagination: true,
        sort: true,
        search: true,
        data: [],
        pageOptions: {
            pageItems: 10
        },
        sortRows: []
    };

    var allowedMethods = ['append', 'remove', 'update', 'reload'];

    $.fn.simpleTable = function () {
        var _this3 = this;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        this.each(function () {
            var $this = $(_this3),
                data = $this.data('simpleTable'),
                options = $.extend({}, SimpleTable.DEFAULTS, $this.data(), _typeof(args[0]) === 'object' && args[0]);
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
                $this.data('simpleTable', data = new SimpleTable(_this3, options));
            }
        });
    };
})(jQuery);