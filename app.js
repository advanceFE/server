const Koa = require('koa');
const cors = require('koa2-cors');
const co = require('co');
const bodyparser = require('koa-bodyparser');
const json = require('koa-json');

const router = require('./routes');
const config = require('./config/startup');
const dbconn = require('./models/connect');
const log = require('./lib/log');


const serve = require('koa-static');

// const render = require('./lib/render');

global.config = config;

dbconn();

const app = new Koa();

// web-hook脚本处理程序
/**
 * 请求体内容解析
 */
app.use(bodyparser({
    enableTypes:['json', 'form', 'text']
}));
app.use(json());
// 静态资源
app.use(serve(__dirname + '/assets'));
// 跨域处理
app.use(cors({
    origin: function (ctx) {
        return '*';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-requested-with'],
}));

app.use(router.routes(), router.allowedMethods());
app.listen(9500, () => {
	log('[server-start]')
});
