<h3 align="center">laravel-admin-expand-table</h3>

    laravel-admin的弹窗table组件，由于目前现在官方Table组件不支持分页且同步，所以做了个js解决它
    简单的js引入调用即可，无过度的封装，使用灵活便于修改自定义
    
![example](https://github.com/ydtg1993/laravel-admin-expand-table/blob/master/example.png)

###后台接口注意
    1.方法POST
    2.默认传参 p:分页分页当前页数  limit:每页条目数 其他传参自定
    3.返回json数据结构 
    
    {
        "data":[                    #数据集
            {"id":1,"name":"馒头"},
            {"id":2,"name":"大米"},
            ...
        ],
        "total":25                  #数据总条目书
    }
