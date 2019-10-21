/**
 * @author zhouxiaojiang@btb.com
 * @desc 一些登录账号
 */
const util = require('../lib/util')


// 跳板机登陆账号
let sfptJump = {
	'btb': {
		host: 'jump.btbex.tech',
		port: 60022, // Normal is 22 port
		username: '15858260500',
		privateKey: util.isOnline ? '' + require('fs').readFileSync('/root/.ssh/tuteng_id_rsa') : ''
 	},
	'hcoin': {
		host: 'jump.hcoin.com',
		port: 60022, // Normal is 22 port
		username: '15858260500',
		privateKey: util.isOnline ? '' + require('fs').readFileSync('/root/.ssh/tuteng_id_rsa') : ''
	},
	'GEx': {
		host: '128.14.7.58',
		port: 22, // Normal is 22 port
		username: 'gxe',
		privateKey: util.isOnline ? '' + require('fs').readFileSync('/root/.ssh/tuteng_id_rsa') : ''
	}
	// 'GEx': {
	// 	host: '120.55.57.232',
	// 	port: 22, // Normal is 22 port
	// 	username: 'root',
	// 	privateKey: util.isOnline ? '' + require('fs').readFileSync('/root/.ssh/github_id_rsa') : ''
	// }
}
function sfptJumpServer(group = 'btb'){
	if (!util.isOnline) {
	  return {
		  host: '120.55.57.232',
		  port: 22, // Normal is 22 port
		  username: 'root',
		  privateKey: '' + require('fs').readFileSync('/Users/sunlvte/.ssh/github_id_rsa')
	  }
		// return {
		// 	host: 'jump.hcoin.com',
		// 	port: 60022, // Normal is 22 port
		// 	username: '15858260500',
		// 	privateKey: '' + require('fs').readFileSync('/Users/sunlvte/.ssh/gitlab_id_rsa')
		// }
	}
	return sfptJump[group] || sfptJump['btb'];
}

// 邮箱登录账号
const mail = {
	//host: 'smtp.office365.com', // 'smtp.aliyun.com',
	host: 'smtp.mxhichina.com', // 'smtp.aliyun.com',
	secure: false,
	auth: {
		user: 'tuteng@flyray.cn',
		pass: util.pass.split('').reverse().join('')
	},
	port: 25,
	transport: "SMTP",
	tls: {
		ciphers: 'SSLv3'
	}
}

module.exports = {
	sfptJumpServer,
	mail
}
