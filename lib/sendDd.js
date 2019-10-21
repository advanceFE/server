const rq = require('request-promise');
const corpid = 'dinge89441358ff739ca35c2f4657eb6378f';
const secret= 'B_1yDPHUe8OiY1Kb5KGKpQl3QXD1OQpBYJwYaudAMo_MIxIu8dMQOj4NsXvQKWzq';    //应用secret
const agentid = 195057142;
const dep_id = 79295180; //部门id
let userlist;
const API = {
    GET_TOKEN: `https://oapi.dingtalk.com/gettoken?corpid=${corpid}&corpsecret=${secret}`,
    SENT_MESSAGE: `https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2?access_token=`,
    DEP_LIST: `https://oapi.dingtalk.com/user/list?access_token=`
}
// https://oapi.dingtalk.com/user/list?access_token=8c9a85ecc82937998d085b5431e7f00f&department_id=79295180
let ACCESS_TOKEN = '';

function getToken(email) {
    return rq({
        uri: API.GET_TOKEN,
        method: 'get',
        json: true
    }).then((res) => {
	    if (res.errcode === 0) {
		    ACCESS_TOKEN = res.access_token || '';
		    return getDepLIst(ACCESS_TOKEN, email)
	    }
    });
}
function getDepLIst(ACCESS_TOKEN, email) {
	return new Promise((resolve, reject) => {
		rq({
			uri: API.DEP_LIST + ACCESS_TOKEN + '&department_id=' + dep_id,
			method: 'get',
			json: true
		}).then((res) => {
			const list = res.userlist.find(item => {
				return item.orgEmail === email
			})
			resolve({list, ACCESS_TOKEN});
		});
	})
}
async function sendToDd({content, email}) {
    const obj  = await getToken(email)
	return new Promise((resolve, reject) => {
		;obj.list && rq({
			uri: `${API.SENT_MESSAGE}${obj.ACCESS_TOKEN}`,
			method: 'post',
			body: {
				agent_id: agentid,
				userid_list: obj.list.userid,
				msg: {
					"msgtype": "text",
					"text": {
						"content": content
					}
				},
			},
			json: true
		}).then((res) => {
			if (res.errcode !== 0) {
				rq({
					uri: `${API.SENT_MESSAGE}${obj.ACCESS_TOKEN}`,
					method: 'post',
					body: {
						agent_id: agentid,
						userid_list: '130400205223169565', //tuteng
						msg: {
							"msgtype": "text",
							"text": {
								"content": `发送构建信息给--${obj.list.orgEmail}-->失败`
							}
						},
					},
					json: true
				})
			}
		})
	})
}
module.exports = sendToDd