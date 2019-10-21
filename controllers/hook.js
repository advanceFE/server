const path = require('path')
const shell = require('shelljs');
const execFileSync = require('child_process').execFileSync;
const execFile = require('child_process').execFile;
const fs = require('fs-extra');
const rimraf = require('rimraf');
const ossdir = require('../oss/ali-oss-dir');
const client = require('../oss/index');
const mail = require('../lib/mail');
const util = require('../lib/util');
const log = require('../lib/log');
const sendDd = require('../lib/sendDd');
const specialPath = require('../config/specialPath');
const specialPath_dev = require('../config/specialPath_dev');
const sftp = require('../lib/sftp');
const pathConfig = require('../config/path');
const tagModel = require('../models/tag');
const repoModel = require('../models/repo');

const cwd = process.cwd();

class Hook {
    constructor () {
        this.taskQueue = []
    }
    async uploadToOSS(ctx, next) {
        let reqBody = ctx.request.body,
            reqProPath = reqBody.project.path_with_namespace,
            reqTagOrBranch = reqBody.ref.replace(/^[^\/]+\/[^\/]+\//, '');
        log(`[get request]: ${reqProPath}/${reqTagOrBranch}, 前面还有${this.taskQueue.length}个任务`)
        const res = await this.doHandle(ctx)
        ctx.body = res
    }
    reHandle() {
        this.taskQueue.shift()
        if (this.taskQueue.length) {
          this.doHandle()
        }
    }
    /**
     * 执行过程：
     *
     * 1. 查看repo里有没有相应的group/repo
     * 2. 有则修改，没有则新建
     * 3. 查看tag有没有相应的tag（用于git删除tag，强制push）(暂时先不支持)
     * 4. 插入tag
     */
    insertDb (insertData) {
        return repoModel.promise('findOne', {
            group: insertData.group,
            repo: insertData.repo
        })
        .then(res => {
            if (res) {
                // return repoModel.promise('update', {
                //     group: insertData.group,
                //     repo: insertData.repo
                // }, {
                //     tag: insertData.tag
                // })
                return
            } else {
                let newInsertData = { ...insertData }
                delete newInsertData.tag
                return new repoModel.model(newInsertData).save()
            }
        })
        // 支持覆盖发布
        .then(res => {
            return tagModel.promise('findOne', {
                group: insertData.group,
                repo: insertData.repo,
                tag: insertData.tag
            })
        })
        .then(res => {
            if (res) {
                return tagModel.promise('update', {
                    group: insertData.group,
                    repo: insertData.repo,
                    tag: insertData.tag
                }, {
                    time: insertData.time,
                    userEmail: insertData.userEmail
                })
            } else {
                return new tagModel.model(insertData).save()
            }
        })
    }

    doHandle(context) {
        if (context) {
            this.taskQueue.push(context)
            if (this.taskQueue.length > 1) {
              return
            }
        }
        // 由于执行build构建操作非常消耗CPU，故服务端构建做了队列处理，一次只构建一个任务
        let ctx = this.taskQueue[0],
            headers = ctx.request.headers,
            gEvt = headers['x-gitlab-event'],
            body = ctx.request.body,
            gitVersionHash = body.checkout_sha,
            sshUrl = body.project.git_ssh_url,
            proPath = body.project.path_with_namespace.split('/'),
            group = proPath[0],
            project = proPath[1],
            // tagOrBranchArr = body.ref.replace(/^[^\/]+\/[^\/]+\//, ''),
            tagOrBranch = body.ref.replace(/^[^\/]+\/[^\/]+\//, ''),
            userEmail = body.user_email,
            userName = userEmail.split('@btb.com')[0],
            startDate = util.now(),
            downLoadRepoPath = `${pathConfig.base}${pathConfig.repo}`,
            buildLog = '',
            oss_path = client.path(group);
	    /**
         * 线上发布执行流程
         *
         * 1. 执行shell脚本进行构建
         * 2. 发送静态资源到oss
         * 3. 记录到数据库
         * <del>4. 发送html到前端服务器（这一条必须确保第2步是OK的）</del>
         * 5. 发送邮件提醒
         */
        if (gEvt === 'Tag Push Hook') {
            let onlinePubPath = `${oss_path}${group}/${project}/${tagOrBranch}/`;
            let cpPath = `${pathConfig.base}${pathConfig.prod}${group}/${project}/${tagOrBranch}`;
            log(`[prod build start]: ${group}/${project}/${tagOrBranch}, by ${userEmail} `)
            if (group === 'GEx') {
                /*
                gxe 项目单独发布
                @onlinePubPath   不上传阿里云
                 */
	            onlinePubPath = '/'
	            return new Promise((resolve, reject) => {
		            execFile(cwd + '/shell/deploy-online_gxe.sh', [
			            downLoadRepoPath,
			            group,
			            project,
			            sshUrl,
			            onlinePubPath,
			            cpPath,
			            tagOrBranch
		            ], { cwd: cwd + '/shell/', maxBuffer: 10 * 200 *1024 }, (err, stdout, stderr) => {
			            buildLog = stdout.replace(/\[\d+m/g, '')
			            // 构建错误
			            if (buildLog.indexOf('ERROR in') > -1 || buildLog.indexOf('Module build failed:') > -1) {
				            rimraf(`${pathConfig.base}${pathConfig.repo}${group}/${project}`, () => {})
				            return reject(buildLog)
			            }
			            resolve()
		            })
	            })
                .then(() => {
                    return this.insertDb({
                        group,
                        repo: project,
                        tag: tagOrBranch,
                        time: startDate,
                        userEmail
                    })
                })
                .then(result => {
                    let completeDate = util.now()
                    log(`[prod build end]: ${group}/${project}/${tagOrBranch}，by ${userEmail}`)
                    mail(userEmail, '前端线上构建提醒', util.sub(util.prodMailTemplate, {
                        sshUrl,
                        startDate,
                        completeDate,
                        gitVersionHash,
                        buildLog,
                        tagOrBranch
                    }))
                    sendDd({
                        email: userEmail,
                        content: `[线上]构建成功\n构建项目：${group}/${project}\n构建分支：${tagOrBranch}\n开始时间：${startDate}\n结束时间：${completeDate}`
                    })
                })
                .catch(err => {
                    let completeDate = util.now()
                    log(`[prod error]: ${err.stack}`, 'error')
                    mail(userEmail, '!!!前端线上构建异常发布提醒', util.sub(util.prodMailTemplate, {
                        sshUrl,
                        startDate,
                        completeDate,
                        gitVersionHash,
                        buildLog: err,
                        tagOrBranch
                    }))
                    sendDd({
	                    email: userEmail,
                        content: `！！！[线上]构建异常\n构建项目：${group}/${project}\n构建分支：${tagOrBranch}\n错误信息：${err}`
                    })
                })
                .finally(() => {
                    this.reHandle()
                })
            } else {
	            return new Promise((resolve, reject) => {
		            execFile(cwd + '/shell/deploy-online.sh', [
			            downLoadRepoPath,
			            group,
			            project,
			            sshUrl,
			            onlinePubPath,
			            cpPath,
			            tagOrBranch
		            ], { cwd: cwd + '/shell/', maxBuffer: 10 * 200 *1024}, (err, stdout, stderr) => {
			            buildLog = stdout.replace(/\[\d+m/g, '')
			            // 构建错误
			            if (buildLog.indexOf('ERROR in') > -1 || buildLog.indexOf('Module build failed:') > -1) {
				            rimraf(`${pathConfig.base}${pathConfig.repo}${group}/${project}`, () => {})
				            return reject(buildLog)
			            }
			            resolve()
		            })
	            })
		            .then(() => {
			            return ossdir(client.ossObj(group))
				            .upload(cpPath)
				            .to(`${group}/${project}/${tagOrBranch}`)
		            })
		            .then(() => {
			            return this.insertDb({
				            group,
				            repo: project,
				            tag: tagOrBranch,
				            time: startDate,
				            userEmail
			            })
		            })
		            .then(result => {
			            let completeDate = util.now()
			            log(`[prod build end]: ${group}/${project}/${tagOrBranch}，by ${userEmail}`)
			            mail(userEmail, '前端线上构建提醒', util.sub(util.prodMailTemplate, {
				            sshUrl,
				            startDate,
				            completeDate,
				            gitVersionHash,
				            buildLog,
				            tagOrBranch
			            }))
			            sendDd({
				            email: userEmail,
				            content: `[线上]构建成功\n构建项目：${group}/${project}\n构建分支：${tagOrBranch}\n开始时间：${startDate}\n结束时间：${completeDate}`
			            })
		            })
		            .catch(err => {
			            let completeDate = util.now()
			            log(`[prod error]: ${err.stack}`, 'error')
			            mail(userEmail, '!!!前端线上构建异常发布提醒', util.sub(util.prodMailTemplate, {
				            sshUrl,
				            startDate,
				            completeDate,
				            gitVersionHash,
				            buildLog: err,
				            tagOrBranch
			            }))
			            sendDd({
				            email: userEmail,
				            content: `！！！[线上]构建异常\n构建项目：${group}/${project}\n构建分支：${tagOrBranch}\n错误信息：${err}`
			            })
		            })
		            .finally(() => {
			            this.reHandle()
		            })
            }

        }
        if (gEvt === 'Push Hook') {
            if (!['dev', 'gray'].includes(tagOrBranch)) {
		        this.reHandle()
		        return
	        }
            let environment = ({dev: '测试', gray: '预发'})[tagOrBranch]
            let dailyPubPath = './';
            let cpPath = `${pathConfig.base}${pathConfig[tagOrBranch]}${group}/${project}`
            let message = body.commits[0] ? body.commits[0].message : ''
            log(`[${tagOrBranch} build start]: ${group}/${project}, by ${userEmail}`)
            if (typeof specialPath_dev[`${group}/${project}`] === 'string') {
                cpPath = `${pathConfig.base}${pathConfig[tagOrBranch]}` + specialPath_dev[`${group}/${project}`]
            }
            return new Promise((resolve, reject) => {
                execFile(cwd + '/shell/deploy-daily.sh',
                    [ downLoadRepoPath,
                        group, 
                        project, 
                        sshUrl, 
                        dailyPubPath,
                        cpPath,
                        tagOrBranch
                        // pathConfig.base + pathConfig.dev + group + '/' + project
                    ], {
                        cwd: cwd + '/shell/',
                        maxBuffer: 10 * 200 *1024
                    },
                    (err, stdout, stderr) => {
                        buildLog = stdout.replace(/\[\d+m/g, '')
                        // 构建错误
                        if (buildLog.indexOf('ERROR in') > -1 || buildLog.indexOf('Module build failed:') > -1) {
                            rimraf(`${pathConfig.base}${pathConfig.repo}${group}/${project}`, () => {})
                            return reject(buildLog)
                        }
                        resolve()
                    }
                );
            })
            .then(() => {
                let completeDate = util.now()
                log(`[${tagOrBranch} build end]: ${group}/${project}, by ${userEmail}`)
                mail(userEmail, `前端${environment}环境构建提醒`, util.sub(util.devMailTemplate, {
                    sshUrl,
                    startDate,
                    completeDate,
                    message,
                    gitVersionHash,
                    buildLog,
                    environment
                }))
                sendDd({
	                email: userEmail,
                    content: `[${environment}]环境构建成功\n构建项目：${group}/${project}\n构建分支：${tagOrBranch}\n开始时间：${startDate}\n结束时间：${completeDate}`
                })
            })
            .catch(err => {
                let completeDate = util.now()
                log(`[${tagOrBranch} error]: ${err.stack}`, 'error')
                mail(userEmail, `!前端${environment}异常发布提醒`, util.sub(util.prodMailTemplate, {
                    sshUrl,
                    startDate,
                    completeDate,
                    message,
                    gitVersionHash,
                    buildLog,
                    environment
                }))
                sendDd({
	                email: userEmail,
                    content: `！！！[${environment}]环境构建异常\n构建项目：${group}/${project}\n构建分支：${tagOrBranch}\n错误信息：${err}`
                })
            })
            .finally(() => {
                this.reHandle()
            })
        } else {
            this.reHandle()
        }

        ctx.body = 666;
        ctx.status = 200;
    }
}

module.exports = new Hook();
