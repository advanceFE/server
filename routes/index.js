const Router = require('koa-router');
const page = require('./page');
const api = require('./api');
const render = require('../lib/render');
const UserController = require('../controllers/user');
const router = new Router();
const nunjucks = require('nunjucks');
const repoModel = require('../models/repo');
const tagModel = require('../models/tag');
const sftp = require('../lib/sftp');
const specialPath = require('../config/specialPath');
const pathConfig = require('../config/path');
const log = require('../lib/log');
const util = require('../lib/util')
const atob = require('atob');
const whitelist = require('../config/whitelist')
const serverPath = require('../config/serverPath')
const process = require('child_process')
const account = require('../config/account')
const jwtDecode = require('jwt-decode');

// tagModel.promise('remove', {})
// repoModel.promise('remove', {})

nunjucks.configure('views', { autoescape: true });
router.use('/home', page.routes(), page.allowedMethods());
router.use('/api', api.routes(), api.allowedMethods());
router.get('/', async (ctx, next) => {
	var repos = await repoModel.promise('find')
  	ctx.body = nunjucks.render('../views/index.html', { 
  		name: 'nunjucks',
  		repos: repos
  	})
})
// 仓库  
router.get('/repo/*', async (ctx, next) => {
  	let requestUrl = ctx.request.url
  	let repoRequest = requestUrl.replace(/^\/repo\//,'').split('/')
  	let pageNumber = repoRequest[2] || 1
  	let queryData = {
  		group: repoRequest[0],
  		repo: repoRequest[1]
  	}
  	let tags = await tagModel.promise('find', queryData)
  	let repos = await repoModel.promise('find')
  	let current = await repoModel.promise('findOne', queryData)
  	let count = await tagModel.promise('count', queryData)
	let tagQuery = tagModel.model.find(queryData).sort('-time')
	let pageTags = await new Promise((resolve, reject) => {
		tagQuery.skip((pageNumber-1) * 10).limit(10).exec('find', function(err, result) {
			if (err) {
				return reject(err)
			} else {
				return resolve(result)
			}
		});
	})
	ctx.body = nunjucks.render('../views/repo.html', { 
		repos,
		tags: pageTags,
		current: current || {},
		count,
		totalPage: (count % 10 === 0) ? (count/10) :  Math.ceil(count / 10),
		pageNumber
	})
})

router.post('/repoapi/rollback', async (ctx, next) => {
	const body = JSON.parse(ctx.request.body)
    let cpPath = `${pathConfig.base}${pathConfig.prod}${body.group}/${body.repo}/${body.tag}`;
    let remotePath = `${body.group}/${body.repo}`;
    let sftpServer = serverPath[remotePath] || serverPath['default']
    // let jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJaaHVSdWlMaW4iLCJuYW1lIjoi5pyx55Ge6ZyWIHwg5bCP5q-bIiwiZGVwdCI6WzEsMl0sImV4cCI6MTUyODUyOTMwMCwiZW1haWwiOiJ6aHVydWlsaW5AYnRiLmNvbSIsInN0YXR1cyI6MX0.Qq5tnrwyBKjnT1cU1lwJHKbeEvBG3WIlb7EV5wOblsc"

	// DNS挂了，先去掉校验。

	let jwt = ctx.cookies.get('jwt')
	if (!jwt || (jwtDecode(jwt) || {}).exp < (new Date().getTime() / 1000)) {
		return ctx.body = {code: 10212, msg: '未登录'}
	}
	const name = (jwtDecode(jwt) || {}).name;
	if (!whitelist.boolCanOperate(name, remotePath)) {
		return ctx.body = {code: 10213, msg: '非白名单用户不可发布'}
	}
    if (typeof specialPath[`${body.group}/${body.repo}`] === 'string') {
        remotePath = specialPath[`${body.group}/${body.repo}`]
    }
    try {
    	const handle = await repoModel.promise('update', {
	        repo: body.repo,
			group: body.group
	    }, {
	        tag: body.tag
	    })
	    .then(() => {
	    	return sftp(cpPath, remotePath, sftpServer, account.sfptJumpServer(body.group), body.group)
	    })
	    .catch(err => {
	    	log(`[publish error]: ${err}`, 'error')
	    })
	    const tagBuild = await tagModel.promise('update', {
	        repo: body.repo,
			group: body.group,
			tag: body.tag
	    }, {
	        buildLog: body.buildLog,
	        buildTime: util.now()
	    })
	    ctx.body = {code: 0, msg: ''}
	    log(`[publish success]: ${body.group}/${body.repo}/${body.tag}`)
    } catch(err) {
    	log(`[publish error]: ${body.group}/${body.repo}/${body.tag}---${err.stack}`, 'error')
    	ctx.body = {code: 1, msg: err.stack}
    }
})


router.post('/preview', async (ctx, next) => {
	const body = JSON.parse(ctx.request.body)
	let group = body.group
	let repo = body.repo
	let tag = body.tag
	let groupRepo = `${group}/${repo}`
	let realPath = typeof specialPath[groupRepo] === 'string' ? specialPath[groupRepo] : groupRepo
	// cp -r dist/* $6;
	// console.log(specialPath, groupRepo, specialPath[groupRepo])
	let fromFolder = `/home/www/prod/${groupRepo}/${tag}/*`
	let toFolder = `/home/www/gray/${realPath}`

	// console.log(realPath)
	process.exec(`mkdir -p ${toFolder};cp -r ${fromFolder} ${toFolder}`,  (error, stdout, stderr) => {
		
	})

	ctx.body = {
		code: 0, 
		msg: '',
		data: {
			url: `http://gray.btb-inc.com/${realPath}`
		}
	}
})

// 日志
router.get('/log', async (ctx, next) => {
	util.logs.splice(0, util.logs.length - 10)
	ctx.body = nunjucks.render('../views/log.html', { 
		logs: util.logs
	})
})
router.post('/log', async (ctx, next) => {
	util.logs.splice(0, util.logs.length - 10)
	ctx.body = {
		code: 1,
		data: util.logs
	}
})
module.exports = router;
