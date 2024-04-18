/**
 * 工具模块，不依赖第三方代码
 */
var ak = ak || {};

ak.Base_URL = location.host;

/**
 * 工具模块，不依赖第三方代码
 * 包含：类型判断
 */
ak.Utils = {

    /**
     * 判断是否Array对象
     * @param {Object} value 判断的对象
     * @return {Boolean}
     */
    isArray: function(value) {
        return toString.call(value) === '[object Array]';
    },

    /**
     * 判断是否日期对象
     * @param {Object} value 判断的对象
     * @return {Boolean}
     */
    isDate: function(value) {
        return toString.call(value) === '[object Date]';
    },

    /**
     * 判断是否Object对象
     * @param {Object} value 判断的对象
     * @return {Boolean}
     */
    isObject: function(value) {
        return toString.call(value) === '[object Object]';
    },

    /**
     * 判断是否为空
     * @param {Object} value 判断的对象
     * @return {Boolean}
     */
    isEmpty: function(value) {
        return value === null || value === undefined || value === '' || (this.isArray(value) && value.length === 0);
    },


    /**
     * 对传入的时间值进行格式化。后台传入前台的时间有两种个是：Sql时间和.Net时间
     * @param {String|Date} sValue 传入的时间字符串
     * @param {dateFormat | bool} dateFormat  日期格式，日期格式：eg：'Y-m-d H:i:s'
     * @return {String} 2014-03-01 这种格式
     * @example
     * 1) Sql时间格式：2015-02-24T00:00:00
     * 2) .Net时间格式：/Date(1410744626000)/
     */
    getDateTimeStr: function(sValue, dateFormat) {
        if (dateFormat == undefined) {
            dateFormat = 'Y-m-d'; // 默认显示年月日
        }

        var dt;
        // 1.先解析传入的时间对象，
        if (sValue) {
            if (toString.call(sValue) !== '[object Date]') {
                // 不为Date格式，就转换为DateTime类型
                sValue = sValue + '';
                if (sValue.indexOf('T') > 0) {
                    // 1)格式：2015-02-24T00:00:00
                    var timestr = sValue.replace('T', ' ').replace(/-/g, '/'); //=> 2015/02/24 00:00:00
                    dt = new Date(timestr);
                } else if (sValue.indexOf('Date') >= 0) {
                    // 2).Net格式：/Date(1410744626000)/
                    //Convert date type that .NET can bind to DateTime
                    //var date = new Date(parseInt(sValue.substr(6)));
                    var timestr = sValue.toString().replace(/\/Date\((\d+)\)\//gi, '$1'); //
                    dt = new Date(Math.abs(timestr));
                } else {
                    dt = new Date(sValue);
                }
            } else {
                dt = sValue;
            }
        }

        // 2.转换
        // 1)转换成对象 'Y-m-d H:i:s'
        var obj = {}; //返回的对象，包含了 year(年)、month(月)、day(日)
        obj.Y = dt.getFullYear(); //年
        obj.m = dt.getMonth() + 1; //月
        obj.d = dt.getDate(); //日期
        obj.H = dt.getHours();
        obj.i = dt.getMinutes();
        obj.s = dt.getSeconds();
        //2.2单位的月、日都转换成双位
        if (obj.m < 10) {
            obj.m = '0' + obj.m;
        }
        if (obj.d < 10) {
            obj.d = '0' + obj.d;
        }
        if (obj.H < 10) {
            obj.H = '0' + obj.H;
        }
        if (obj.i < 10) {
            obj.i = '0' + obj.i;
        }
        if (obj.s < 10) {
            obj.s = '0' + obj.s;
        }
        // 3.解析
        var rs = dateFormat
            .replace('Y', obj.Y)
            .replace('m', obj.m)
            .replace('d', obj.d)
            .replace('H', obj.H)
            .replace('i', obj.i)
            .replace('s', obj.s);

        return rs;
    },

    /**
     * 讲json字符串转换为json对象
     * @param {String} jsonStr Json对象字符串
     * @return {jsonObj} Json对象
     */
    toJson: function(jsonStr) {
        return JSON.parse(jsonStr);
    },

};

/**
 * http交互模块
 * 包含：ajax
 */
ak.Http = {

    /**
     * 把对象转换为查询字符串
     * e.g.:
     *     toQueryString({foo: 1, bar: 2}); // returns "foo=1&bar=2"
     *     toQueryString({foo: null, bar: 2}); // returns "foo=&bar=2"
     *     toQueryString({date: new Date(2011, 0, 1)}); // returns "date=%222011-01-01T00%3A00%3A00%22"
     * @param {Object} object 需要转换的对象
     * @param {Boolean} [recursive=false] 是否递归
     * @return {String} queryString
     */
    toQueryString: function(object, recursive) {
        var paramObjects = [],
            params = [],
            i,
            j,
            ln,
            paramObject,
            value;

        for (i in object) {
            if (object.hasOwnProperty(i)) {
                paramObjects = paramObjects.concat(this.toQueryObjects(i, object[i], recursive));
            }
        }

        for (j = 0, ln = paramObjects.length; j < ln; j++) {
            paramObject = paramObjects[j];
            value = paramObject.value;

            if (ak.Utils.isEmpty(value)) {
                value = '';
            } else if (ak.Utils.isDate(value)) {
                value =
                    value.getFullYear() +
                    '-' +
                    Ext.String.leftPad(value.getMonth() + 1, 2, '0') +
                    '-' +
                    Ext.String.leftPad(value.getDate(), 2, '0') +
                    'T' +
                    Ext.String.leftPad(value.getHours(), 2, '0') +
                    ':' +
                    Ext.String.leftPad(value.getMinutes(), 2, '0') +
                    ':' +
                    Ext.String.leftPad(value.getSeconds(), 2, '0');
            }

            params.push(encodeURIComponent(paramObject.name) + '=' + encodeURIComponent(String(value)));
        }

        return params.join('&');
    },

    /**
     * 以get方式请求获取JSON数据
     * @param {Object} opts 配置项，可包含以下成员:
     * @param {String} opts.url 请求地址
     * @param {Object} opts.params 附加的请求参数
     * @param {Boolean} opts.isHideLoading 是否关闭'载入中'提示框，默认false
     * @param {String} opts.loadingTitle '载入中'提示框title，e.g. 提交中、上传中
     * @param {Function} opts.successCallback 成功接收内容时的回调函数
     * @param {Function} opts.failCallback 失败的回调函数
     */
    get: function(opts) {
        if (!opts.isHideLoading) {
            ak.Msg.showLoading(opts.loadingTitle);
        }
        if (opts.url.substr(0, 1) == '/') {
            opts.url = opts.url.substr(1);
        }
        opts.url = ak.Base_URL + opts.url;
        if (opts.params) {
            opts.url = opts.url + '?' + this.toQueryString(opts.params);
        }
        // Jquery、Zepto
        $.getJSON(
            opts.url,
            function(res, status, xhr) {
                ak.Msg.hideLoading();
                if (res.resultCode == '0') {
                    if (opts.successCallback) {
                        opts.successCallback(res);
                    }
                } else {
                    ak.Msg.toast(res.resultText, 'error');
                    if (opts.failCallback) {
                        opts.failCallback(res);
                    }
                }
            },
            'json'
        );
    },

    /**
     * 以get方式请求获取JSON数据
     * @param {Object} opts 配置项，可包含以下成员:
     * @param {String} opts.url 请求地址
     * @param {Object} opts.params 附加的请求参数
     * @param {Boolean} opts.ignoreFail 忽略错误，默认false，不管返回的结果如何，都执行 successCallback
     * @param {Boolean} opts.ignoreEmptyParam 忽略空值，默认true
     * @param {Boolean} opts.isHideLoading 是否关闭'载入中'提示框，默认false
     * @param {String} opts.loadingTitle '载入中'提示框title，e.g. 提交中、上传中
     * @param {Function} opts.successCallback 成功接收内容时的回调函数
     * @param {Function} opts.failCallback 失败的回调函数
     */
    post: function(opts) {
        opts.ignoreFail = opts.ignoreFail == undefined ? false : opts.ignoreFail;
        opts.ignoreEmptyParam = opts.ignoreEmptyParam == undefined ? true : opts.ignoreEmptyParam;
        if (!opts.isHideLoading) {
            ak.Msg.showLoading(opts.loadingTitle);
        }
        if (opts.url.substr(0, 1) == '/') {
            opts.url = opts.url.substr(1);
        }
        opts.url = ak.Base_URL + opts.url; // test

        // 去除params的空值
        if (opts.ignoreEmptyParam) {
            for (var key in opts.params) {
                if (opts.params[key] == undefined || opts.params[key] == '') {
                    delete opts.params[key];
                }
            }
        }
        // Jquery、Zepto
        $.post(
            opts.url,
            opts.params,
            function(res, status, xhr) {
                ak.Msg.hideLoading();
                if (res.resultCode == '0' || opts.ignoreFail) {
                    if (opts.successCallback) {
                        opts.successCallback(res);
                    }
                } else {
                    ak.Msg.toast(res.resultText, 'error');
                    if (opts.failCallback) {
                        opts.failCallback(res);
                    }
                }
            },
            'json'
        );
    },

    /**
     * 上传文件
     * @param {Object} opts 配置项，可包含以下成员:
     * @param {Object} opts.params 上传的参数
     * @param {Object} opts.fileParams 上传文件参数
     * @param {String} opts.url 请求地址
     * @param {Function} opts.successCallback 成功接收内容时的回调函数
     * @param {Function} opts.failCallback 失败的回调函数
     */
    uploadFile: function(opts) {
        // 1.解析url
        if (opts.url.substr(0, 1) == '/') {
            opts.url = opts.url.substr(1);
        }
        opts.url = ak.Base_URL + opts.url;
        if (opts.params) {
            opts.url = opts.url + '?' + this.toQueryString(opts.params);
        }

        // 2.文件参数
        var formData = new FormData();
        for (var key in opts.fileParams) {
            formData.append(key, opts.fileParams[key]);
        }

        // 3.发起ajax
        $.ajax({
                url: opts.url,
                type: 'POST',
                cache: false,
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json'
            })
            .done(function(res) {
                if (res.resultCode != '0') {
                    ak.Msg.toast(res.resultText, 'error');
                }
                if (opts.successCallback) {
                    opts.successCallback(res);
                }
            })
            .fail(function(res) {
                if (opts.failCallback) {
                    opts.failCallback(res);
                }
            });
    }
};

/**
 * 消息模块
 * 包含：确认框、信息提示框
 */
ak.Msg = {
    /**
     * 提示框
     * msg {string} ：信息内容
     */
    alert: function(msg) {},

    /**
     * 确认框
     * msg {string} ：信息内容
     * callback {function} ：点击'确定'时的回调函数。
     */
    confirm: function(msg, callback) {

    },

    /**
     * 显示正在加载
     * @param {String} title 显示的title
     */
    showLoading: function(title) {

    },

    /**
     * 关闭正在加载
     */
    hideLoading: function() {},

    /**
     * 自动消失的提示框
     * @param {String} msg 信息内容
     */
    toast: function(msg) {}
};

/**
 * 业务相关逻辑
 */
ak.BLL = {};

export default ak;
