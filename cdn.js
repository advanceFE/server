const Koa = require('koa');

// dailyCDN静态资源托管

const dailyCdnApp = new Koa();

dailyCdnApp.use(require('koa-static')(__dirname + '/download/branch'))

dailyCdnApp.listen(8501);


// dailyHTML静态资源托管

dailyHtmlApp = new Koa();
dailyHtmlApp.use(require('koa-static')(__dirname + '/download/html'));
dailyHtmlApp.listen(8502);