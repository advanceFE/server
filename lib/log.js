/**
 * 日志
 */
const log4js = require('log4js')
const path = require('path')
const util = require('./util')

log4js.configure({
  appenders: { 
    file: { 
      type: 'file', 
      filename: path.resolve(__dirname, '../../server-log/log.log'),
      maxLogSize: 100 * 1024 * 1024, // = 200Mb
      compress: true, // compress the backups
      encoding: 'utf-8'
    }
  },
  categories: { 
    default: { appenders: ['file'], level: 'trace' }
  }
})
const logger = log4js.getLogger('fe-build')
function log(msg, type) {
  if (util.isOnline) {
    logger[type || 'trace'](msg)
    util.logs.push({
      date: util.now(),
      type: type || 'trace',
      msg: msg
    })
  } else {
    console.log(msg)
  }
}
module.exports = log
