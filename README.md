# simpleTable
超简单，超小的jQuery表格插件

## Why I did this?
---
之前一直用dataTable进行表格的处理，dataTable是一个很好的表格解决方案。但是感觉我在日常开发中，dataTable中有很多功能我都是没有使用到的，以致于引入了许多不必要的代码。所以我根据自己的业务需求整了一个，功能非常的简单，甚至有点太简单了，连样式都没有(如果嫌麻烦可以直接用我提供的样式)，但是这提供了一个很好的自定义方案。

## Features

* 搜索
* 排序
* 分页
* 添加
* 删除
* 更新
* 重新载入数据

## Usage

首先你需要引入jQuery(1.10+):

```html
<script src="./lib/jquery.js"></script>
```

引入simpleTable:

```html
<script src="./simpleTable2.js"></script>
```

在`html`中定义表头:

```html
<table id="simpleTable">
    <thead>
        <tr>
            <th>类型</th><th>版本号</th><th>文件名</th><th>上传时间</th><th>操作</th>
        </tr>
    </thead>
</table>
```

初始化数据:

```js
$('#simpleTable').simpleTable({
    data: [
        [2, "bbb", "aaa", '9.9.9.9', 5],
        [21, "aaa", "ss", '6.4.0.3', 10],
        [16, "ccc", 18, '6.3.0.1', 20],
        [1, 7, "ddd", '6.3.0.0', 10],
    ]
});
```
done!

## API

### 默认值

```js
$('#simpleTable').simpleTable({
    data: [],         // 传入的数据
    sort: true,       // 是否排序
    sortRow: [],      // 需要排序的列，只有开启了sort才会有用，默认所有列都排序。传进去的应该是一个布尔值的数组，数组大小应与表头一致
    sortIcons: ['fa fa-long-arrow-down', 'fa fa-long-arrow-up'],
                      // 所排序的列的icon，默认使用fonts-awesome
    search: true,     // 是否有搜索框
    pagination: true, // 是否分页
    pageOptions: {
        pageItems: 10 // 每一页的项数，只有开启了pagination才有效
    },
});
```

### 添加数据
请保证数据的项数与表头一致:

```js
$('#simpleTable').simpleTable('append', [24, 'ope', 18, '1.1.1', 22]);
```

### 删除数据
请将相应行的dom元素传进去:

```js
$('#simpleTable').simpleTable('remove',$($('#simpleTable').find('[data-rowid]')[2]));
```

### 更新数据
请将相应行的dom元素和更新的数据传进去:

```js
$('#simpleTable').simpleTable('update',
                $($('#simpleTable').find('[data-rowid]')[2]),
                ["21sid", "aaasid", "sssid", '6.4.0.3sid', 10]);
```

### 重新载入数据
这对于通过ajax来更新数据十分有效，该方法会先清空原有的数据然后注入新的数据：

```js
$('#simpleTable').simpleTable('reload',
        [
            [1,2,3,4,5],
            [6,7,8,9,10],
            [11,12,13,14,15],
            [16,17,18,19,20],
            [21,22,23,24,25]
        ]
);
```

## 注意
es6文件夹里面的东西是es6版本的simpleTable，没有经过测试，所以请以`dist/simpleTable.js`为准。
