// 在同一个浏览器上下文中，前一个网页（与当前页面不一定同域）unload 的时间戳，如果无前一个网页 unload ，则与 fetchStart 值相等
// navigationStart: 1441112691935,

// // 前一个网页（与当前页面同域）unload 的时间戳，如果无前一个网页 unload 或者前一个网页与当前页面不同域，则值为 0
// unloadEventStart: 0,

// // 和 unloadEventStart 相对应，返回前一个网页 unload 事件绑定的回调函数执行完毕的时间戳
// unloadEventEnd: 0,

// // 第一个 HTTP 重定向发生时的时间。有跳转且是同域名内的重定向才算，否则值为 0 
// redirectStart: 0,

// // 最后一个 HTTP 重定向完成时的时间。有跳转且是同域名内部的重定向才算，否则值为 0 
// redirectEnd: 0,

// // 浏览器准备好使用 HTTP 请求抓取文档的时间，这发生在检查本地缓存之前
// fetchStart: 1441112692155,

// // DNS 域名查询开始的时间，如果使用了本地缓存（即无 DNS 查询）或持久连接，则与 fetchStart 值相等
// domainLookupStart: 1441112692155,

// // DNS 域名查询完成的时间，如果使用了本地缓存（即无 DNS 查询）或持久连接，则与 fetchStart 值相等
// domainLookupEnd: 1441112692155,

// // HTTP（TCP） 开始建立连接的时间，如果是持久连接，则与 fetchStart 值相等
// // 注意如果在传输层发生了错误且重新建立连接，则这里显示的是新建立的连接开始的时间
// connectStart: 1441112692155,

// // HTTP（TCP） 完成建立连接的时间（完成握手），如果是持久连接，则与 fetchStart 值相等
// // 注意如果在传输层发生了错误且重新建立连接，则这里显示的是新建立的连接完成的时间
// // 注意这里握手结束，包括安全连接建立完成、SOCKS 授权通过
// connectEnd: 1441112692155,

// // HTTPS 连接开始的时间，如果不是安全连接，则值为 0
// secureConnectionStart: 0,

// // HTTP 请求读取真实文档开始的时间（完成建立连接），包括从本地读取缓存
// // 连接错误重连时，这里显示的也是新建立连接的时间
// requestStart: 1441112692158,

// // HTTP 开始接收响应的时间（获取到第一个字节），包括从本地读取缓存
// responseStart: 1441112692686,

// // HTTP 响应全部接收完成的时间（获取到最后一个字节），包括从本地读取缓存
// responseEnd: 1441112692687,

// // 开始解析渲染 DOM 树的时间，此时 Document.readyState 变为 loading，并将抛出 readystatechange 相关事件
// domLoading: 1441112692690,

// // 完成解析 DOM 树的时间，Document.readyState 变为 interactive，并将抛出 readystatechange 相关事件
// // 注意只是 DOM 树解析完成，这时候并没有开始加载网页内的资源
// domInteractive: 1441112693093,

// // DOM 解析完成后，网页内资源加载开始的时间
// // 在 DOMContentLoaded 事件抛出前发生
// domContentLoadedEventStart: 1441112693093,

// // DOM 解析完成后，网页内资源加载完成的时间（如 JS 脚本加载执行完毕）
// domContentLoadedEventEnd: 1441112693101,

// // DOM 树解析完成，且资源也准备就绪的时间，Document.readyState 变为 complete，并将抛出 readystatechange 相关事件
// domComplete: 1441112693214,

// // load 事件发送给文档，也即 load 回调函数开始执行的时间
// // 注意如果没有绑定 load 事件，值为 0
// loadEventStart: 1441112693214,

// // load 事件的回调函数执行完毕的时间
// loadEventEnd: 1441112693215

let newTiming = {
    "navigationStart": 1527153376910,
    "unloadEventStart": 1527153376928,
    "unloadEventEnd": 1527153376928,
    "redirectStart": 0,
    "redirectEnd": 0,
    "fetchStart": 1527153376916,
    "domainLookupStart": 1527153376916,
    "domainLookupEnd": 1527153376916,
    "connectStart": 1527153376916,
    "connectEnd": 1527153376916,
    "secureConnectionStart": 0,
    "requestStart": 1527153376920,
    "responseStart": 1527153376925,
    "responseEnd": 1527153376928,
    "domLoading": 1527153376939,
    "domInteractive": 1527153377266,
    "domContentLoadedEventStart": 1527153377266,
    "domContentLoadedEventEnd": 1527153377267,
    "domComplete": 1527153378180,
    "loadEventStart": 1527153378180,
    "loadEventEnd": 1527153378183
}
console.log(newTiming.domComplete - newTiming.fetchStart)
let oldTiming = {
    "navigationStart": 1527153397184,
    "unloadEventStart": 1527153397981,
    "unloadEventEnd": 1527153397981,
    "redirectStart": 0,
    "redirectEnd": 0,
    "fetchStart": 1527153397190,
    "domainLookupStart": 1527153397190,
    "domainLookupEnd": 1527153397190,
    "connectStart": 1527153397190,
    "connectEnd": 1527153397190,
    "secureConnectionStart": 0,
    "requestStart": 1527153397194,
    "responseStart": 1527153397977,
    "responseEnd": 1527153397980,
    "domLoading": 1527153397993,
    "domInteractive": 1527153399540,
    "domContentLoadedEventStart": 1527153399540,
    "domContentLoadedEventEnd": 1527153399542,
    "domComplete": 1527153400630,
    "loadEventStart": 1527153400630,
    "loadEventEnd": 1527153400633
}
console.log(oldTiming.domComplete - oldTiming.fetchStart)
