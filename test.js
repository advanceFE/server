const fs = require('fs')
const Client = require('ssh2').Client;
const account = {
	host: '128.14.7.58',
	port: 22, // Normal is 22 port
	username: 'gxe',
	privateKey: '' + require('fs').readFileSync('/Users/sunlvte/.ssh/tuteng_id_rsa')
}
function promiseSftp(sftp, action, param) {
	return new Promise((resolve, reject) => {
		sftp[action](param, (err, result) => {
			if (err) {
				return reject(err)
			} else {
				return resolve(result)
			}
		})
	})
}
function uploadHtml() {
	return new Promise((resolve, reject) => {
		const conn = new Client()
		// ssh连接跳板机服务器
		conn.on('ready', () => {
			// 启用sftp服务
			conn.sftp((err, sftp) => {
				// 基于sftp打开跳板机上的前端服务器
				promiseSftp(sftp, 'opendir', './')
				// 发送文件
					.then(() => {
						conn.exec('cd ./html && touch 1.txt && cd ' + 'sun/html' + ' && cd .. && touch dd.html', (err, data) => {
							conn.end()
							resolve()
						})
					})

					.catch(err => {
						reject(err)
					})
			});

		}).connect(account);
	})
}

uploadHtml()