/**
 * @author wujing@btb.com
 * @desc 发送邮件服务
 */
const nodemailer = require('nodemailer')
const log = require('./log')
const util = require('./util')
const account = require('../config/account')
// const util = require('./util')

// const DEFAULT_USER = 'btb_fe@aliyun.com'
// 任务列表
let taskQueue = []
let userMail = 'tuteng@flyray.cn'
const transporter = nodemailer.createTransport(account.mail)
// const transporter = nodemailer.createTransport({
//   host: 'smtp.aliyun.com',
//   secure: true,
//   auth: {
//     user: 'btb_fe@aliyun.com',
//     pass: 'btb.com'
//   },
//   transport: "SMTP"
// })

function doSendMail(info) {
  // 发邮件限流
  if (info) {
    taskQueue.push(info)
    if (taskQueue.length > 1) {
      return
    }
  }
  transporter.sendMail({
    from: `"【前端构建提醒】" <${userMail}>`, // sender address
    to: taskQueue[0].to, // DEFAULT_USER || USER_LIST[app] || DEFAULT_USER, // list of receivers
    subject: taskQueue[0].subject, // Subject line
    text: taskQueue[0].text,
    html: taskQueue[0].text
  }, (err, info) => {
    if(taskQueue.length) {
      setTimeout(() => {
        taskQueue.shift()
        if (taskQueue.length) {
          doSendMail()
        }
      }, Math.floor(Math.random() * 1000))
		}
    if (err) {
      log('[mailerror]' + err, 'error')
    }
  })
}

// sendMail
function sendMail(to, subject, text) {
  doSendMail({
    to,
    subject,
    text
  })
}
module.exports = sendMail
