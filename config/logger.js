/**
 * @author S.Jarvis<bird.jarvis@gmail.com>
 * @use 日志配置文件
 */
const path = require('path');

// 日志根目录
const baseLogPath = path.resolve(__dirname, '../logs');

//错误日志输出完整路径
const errorLogPath = path.resolve(baseLogPath, "error/error");
 
//响应日志输出完整路径
const responseLogPath = path.resolve(baseLogPath, "response/response");

module.exports = {
    appenders: {
        errorLogger: {
            type: 'dateFile',
            filename: errorLogPath,
            pattern: "-yyyy-MM-dd-hh.log",   //每小时创建一个新的日志文件
            alwaysIncludePattern: true, //将模式包含在当前日志文件的名称和备份中。
            keepFileExt: true,
            path: "/error" 
        },
        resLogger: {
            type: 'dateFile',
            filename: responseLogPath,
            pattern: "-yyyy-MM-dd-hh.log",    //后缀，每小时创建一个新的日志文件
            alwaysIncludePattern: true, //将模式包含在当前日志文件的名称和备份中。
            daysToKeep: 30,
            compress: true,
            keepFileExt: true,
            path: "/response"
        }
    },
    categories: {
        default: { appenders: ['resLogger'], level: 'all' },
        error: { appenders: ['errorLogger'], level: 'error'}
    },
    pm2: true,
    //logs根目录
    baseLogPath: baseLogPath
}