/**
 * @author zhouxiaojiang@btb.com
 * @desc sftp上传文件服务
 */
const fs = require('fs')
const Client = require('ssh2').Client;
const log = require('../lib/log');
const http = require('http')
const qs = require('querystring')
const FE_SERVER_DIR = 'btb@ex-web-01_10.1.0.67:22'

// promise 化的 sftp api 调用
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

// 查看是否含有文件夹
function sftpExistFile(sftp, parentDirectory, folder) {
	return promiseSftp(sftp, 'readdir', parentDirectory)
		.then(result => {
			let fileList = result.map(v => v.filename)
			return fileList.includes(folder)
		})
}

function sendPost(options,postData) {
	var req = http.request(options, function () {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			log(`[sh success]: now`,)
		});
	});

	req.on('error', function (e) {
		console.log('problem with request: ' + e.message);
	});

	req.end(postData);
}

/**
 * 上传html到前端服务器
 * @param {localPath} 本地路径
 * @param {remotePath} 远程路径
 * @return {Promise} 
 */
/**
 * 执行过程：
 *
 * 1. 跟跳板机建立ssh连接
 * 2. 开启sftp服务
 * 3. 遍历本地的html文件
 * 4. 判断远程是否存在相应的文件夹，没有则创建文件夹，这一步骤异常绕
 * 5. 执行上传的操作
 */
/*
 * 备用api：
 * 
 * 用于读取是否包含某个文件夹
 * sftp.readdir('./', (err, result) => {
 *   console.log(result.map(v => v.filename))
 * })
 * 创建文件夹 sftp.mkdir
 * 执行脚本 conn.exec 
 */
function uploadHtml (localPath, remotePath, sftpServer, sftpTar, group) {
	console.log(sftpTar.host);
	const options = {
		hostname: sftpTar.host,
		port: 3777,
		path: '/sendpath',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8'
		}
	}
	const postData = JSON.stringify({path: remotePath})
	console.log(postData);
	return new Promise((resolve, reject) => {
		const conn = new Client()
		// ssh连接跳板机服务器
		conn.on('ready', () => {
			 // 启用sftp服务
		    conn.sftp( (err, sftp) => {
		        if (err) {
		        	return reject(err)
		        }
		        // 基于sftp打开跳板机上的前端服务器
		        promiseSftp(sftp, 'opendir', sftpServer)
		        	// 创建文件夹
		        	.then(() => {
		        		let directoryArr = remotePath.split('/')
				        if(remotePath && directoryArr.length === 1&&directoryArr[0] !== '.') {
		        			return sftpExistFile(sftp, './html', `${directoryArr[0]}`)
		        				.then(has => {
							        if (!has) {
		        						return promiseSftp(sftp, 'mkdir', `./html/${directoryArr[0]}`)
		        					}
		        				})
		        		} else if(remotePath && directoryArr.length === 2){
		        			return sftpExistFile(sftp, './html', directoryArr[0])
		        				.then(has => {
		        					if (!has) {
		        						return promiseSftp(sftp, 'mkdir', `./html/${directoryArr[0]}`)
		        							.then(() => {
		        								return false
		        							})
		        					}
		        				})
		        				.then(() => {
		        					return sftpExistFile(sftp, `./html/${directoryArr[0]}`, directoryArr[1])
		        				})
		        				.then(has => {
		        					if (!has) {
		        						return promiseSftp(sftp, 'mkdir', `./html/${remotePath}`)
		        					}
		        				})
		        		}
		        	})
		        	// 发送文件
		        	.then(() => {
		        		// 读取前端待发布仓库文件
				        fs.readdir(localPath, (err, files) => {
			            	// 遍历dist/*.html，仅限第一级子目录
					        ;(files || [])
			                	.filter(v => v.endsWith('.html') || v.endsWith('.tar'))
			                	.forEach((v, k) => {
					                var readStream = fs.createReadStream(`${localPath}/${v}`);
					                var writeStream = sftp.createWriteStream(`./html/${remotePath}/${v}`);
					                // 自动关闭意味着文件上传成功
			                        writeStream.on('close', () => {
				                        conn.end()
				                        resolve()
				                        log(`[sftp success]: sftp`,)
				                        sendPost(options, postData)
			                        })
			                        writeStream.on('error', err => {
			                            conn.end()
			                            reject(err)
			                        });
			                        readStream.pipe(writeStream);
			                		
			                	});
			            });
		        	})
		        	.catch(err => {
		        		reject(err)
		        	})
		        
		    });

		}).connect(sftpTar);
	})
}

// uploadHtml('./', 'fetest/btb')

module.exports = uploadHtml


