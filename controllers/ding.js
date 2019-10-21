const JWT = require("jsonwebtoken");
const User = require('../models/user');
var request = require('request');
const qs = require('querystring')
const APPID = 'dingoaionks6jvozdgyp69';
const APPSECRET = 'z8rjU2KlvRPKmnU4c8BZ9P60P9HceC7gGUjHxz6KvfAuBSFisRXGywcp3N74wx5B';
const options = {
	url1: `https://oapi.dingtalk.com/sns/gettoken?appid=${APPID}&appsecret=${APPSECRET}`,
	url2: `https://oapi.dingtalk.com/sns/get_persistent_code?access_token=`,
	url3: `https://oapi.dingtalk.com/sns/get_sns_token?access_token=`,
	url4: `https://oapi.dingtalk.com/sns/getuserinfo?sns_token=`,
}


function getReq(options) {
    return new Promise((resolve, reject) => {
	    request(options, function (err, res, body) {
            if (err) {
              reject(err)
            } else {
		      resolve(body)
            }
	    });
    })
}
class DDController {
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
	async getJwt(ctx,next) {
	    let body = JSON.parse(ctx.request.body)
		let ACCESS_TOKEN;
		const $token = await getReq(options.url1)
			.then(res => {
				ACCESS_TOKEN = JSON.parse(res).access_token;
				const rq_options = {
					url: options.url2 + ACCESS_TOKEN,
					method: 'POST',
					body:JSON.stringify({ "tmp_auth_code": body.code})
				}
				return getReq(rq_options)
			})
			.then(res => {
				const sns_options = {
					url: options.url3 + ACCESS_TOKEN,
					method: 'POST',
					body:res
				}
				return getReq(sns_options)
			})
			.then(res => {

				const user_options ={
					url: options.url4 + JSON.parse(res).sns_token
				}
				return getReq(user_options)
			})
			.then(res => {
				try{
					const name = JSON.parse(res).user_info.nick;
					let token = JWT.sign({name: name}, global.config.JWT_SECRET, {
						expiresIn: '1d'
					});
					return token
				} catch (e) {
					return false
				}

			})
			.catch(e => {
				console.log(e);
			})
		if ($token) {
			ctx.cookies.set('jwt', $token, {'Access-Control-Allow-Credentials':true ,maxAge:7200000,httpOnly:false});
			ctx.body = {
				status: true,
				code: 200,
				message: `登录成功`
			}
		} else {
			ctx.body = {
				status: true,
				code: 403,
				message: 'error'
			}
		}

	    // const gettoken_body = await getReq(options.url1)
	    // if (!gettoken_body) {
			// res_err(ctx)
	    // }
	    // const ACCESS_TOKEN = JSON.parse(gettoken_body).access_token;
	    //
	    // const rq_options = {
	    //     url: options.url2 + ACCESS_TOKEN,
		 //    method: 'POST',
         //    body:JSON.stringify({ "tmp_auth_code": body.code})
	    // }
	    // const openid_Body = await getReq(rq_options)
	    // if (!openid_Body) {
			// res_err(ctx)
	    // }
	    // const sns_options = {
		 //    url: options.url3 + ACCESS_TOKEN,
		 //    method: 'POST',
		 //    body:openid_Body
	    // }
	    // const sns_token = await getReq(sns_options)
	    // if (!sns_token) {
			// res_err(ctx)
	    // }
	    // const user_options ={
		 //    url: options.url4 + JSON.parse(sns_token).sns_token
	    // }
	    // const user_info = await getReq(user_options)
	    // if (!user_info) {
			// res_err(ctx)
	    // }
	    // const name = JSON.parse(user_info).user_info.nick;
	    // let token = JWT.sign({name: name}, global.config.JWT_SECRET, {
		 //    expiresIn: '1d'
	    // });
	    // ctx.cookies.set('jwt', token);
	    // ctx.body = {
		 //    status: true,
		 //    message: `登录成功`
	    // }
    }
}

module.exports = new DDController();