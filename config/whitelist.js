
const adminAccount = [
	'jushi', 
	'xiaomao',
	'wujing', 
	'shenyi',
	'xuanzang',
	'tuteng',
	'banli',
	'bihao',
	'孙吕特',
	'周柏民',
	'王立新'
];
const operationAccount = [
	'wangjingao'
];
const btbAccount = [
	'tuteng',
	'banli'
]

const authConfig = {
	'exchange/btb-web': {
		list: [...btbAccount]
	},
	'operation/acth5': {
		list: [...operationAccount]
	},
	'operation/actpc': {
		list: [...operationAccount]
	},
	'xiaomao/repo1': {
		list: ['xiaomao']
	},
	'fe-web/kyc': {
		list: ['']
	},
	'fe-manage/btb-bops': {
		list: ['xuanzang', 'chuangshi']
	},
	'fe-manage/account': {
		list: ['tianya']
	},
	'fe-web/activity-h5': {
		list: ['banli']
	},
}


module.exports = {
	boolCanOperate: function(userId, project) {
		if (!userId || !project) return false;
		return adminAccount.includes(userId) || (authConfig[project] || {list: []}).list.includes(userId);
	}
}