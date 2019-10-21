const JWT = require("jsonwebtoken");
const User = require('../models/user');


class UserController {
    /**
     * 登录验证
     * @param {Object} ctx koa上下文
     * @param {Function} next 中间件继续执行函数
     */
    async login (ctx, next) {
        let body = ctx.request.body,
            username = body.username,
            password = body.password;
        let user = await User.findOne({ username });
        if (!user) {
            ctx.body = {
                status: false,
                message: `用户不存在`
            }
            return;
        }
        if (user.comparePassword(password)) {
            let token = JWT.sign({name: user.username}, global.config.JWT_SECRET, {
                expiresIn: '30d'
            });
            user.token = token;
            user.save();
            ctx.body = {
                status: true,
                message: `登录成功`,
                token
            }
            return;
        }
        ctx.body = {
            status: false,
            message: `密码错误`
        }
    }
    async isLogin (username, token) {
        let payload = JWT.verify(token, global.config.JWT_SECRET);
        console.log(payload);
    }

    /**
     * 用户退出
     * @param {Object} ctx koa上下文
     * @param {Function} next 中间件继续执行函数
     */
    async logout (ctx, next) {
        let body = ctx.request.body;


    }
}

module.exports = new UserController();