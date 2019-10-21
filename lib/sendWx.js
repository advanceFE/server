const rq = require('request-promise');
const corpid = 'ww3b982ceff4bbf896';
const secret= 'cg9PQ2a3wuwC1UfSam6wKokoYaBXzqz5LjIwT-TrV_w';    //应用secret
const agentid = 1000003;
const API = {
    GET_TOKEN: `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${secret}`,
    SENT_MESSAGE: `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=`
}

let ACCESS_TOKEN = '';

function getToken() {
    return rq({
        uri: API.GET_TOKEN,
        method: 'get',
        json: true
    }).then((res) => {
        if (res.errcode === 0) {
            ACCESS_TOKEN = res.access_token || '';
        }
    });
}
async function sendToWx(config, isRetry) {
    if (!ACCESS_TOKEN) {
        await getToken();       
    }
    return new Promise((resolve, reject) => {
        rq({
            uri: `${API.SENT_MESSAGE}${ACCESS_TOKEN}`,
            method: 'post',
            body: {
                touser: config.touser,
                msgtype: 'text',
                text: {
                    content: config.content
                },
                agentid
            },
            json: true
        }).then((res) => {
            // TOKEN失效
            if (res.errcode == 42001) {
                ACCESS_TOKEN = '';
                if (!isRetry) {
                    sendToWx(config, true);
                }
                return;
            }
            // 推送失败则向小毛发消息
            if (res.invaliduser) {
                rq({
                    uri: `${API.SENT_MESSAGE}${ACCESS_TOKEN}`,
                    method: 'post',
                    body: {
                        touser: 'xiaomao',
                        msgtype: 'text',
                        text: {
                            content: `！！！消息推送失败！！！用户：${res.invaliduser}`
                        },
                        agentid
                    },
                    json: true
                });
            }
            resolve(res);
        }, (err) => {
            reject(err);
        });
    });
}
module.exports = sendToWx