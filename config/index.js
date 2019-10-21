const oss_params = {
	'btb': {
		region: 'oss-cn-hongkong',
		accessKeyId: 'LTAIVkmBPqsV43zM',
		accessKeySecret: 'J8engB68M8RKbuaPyd24Kz5ffxkEjx',
		bucket: 'btb-idx-fe'
	},
	'hcoin': {
		region: 'oss-cn-hongkong',
		accessKeyId: 'LTAIqT2H6uCM2BHf',
		accessKeySecret: 'ntQU5pTRwwR62g6wGJnmXSyVmBe8OD',
		bucket: 'hcoin-idx-fe'
	},
	// tuteng测试
	'tuteng': {
		region: 'oss-cn-hongkong',
		accessKeyId: 'LTAIqT2H6uCM2BHf',
		accessKeySecret: 'ntQU5pTRwwR62g6wGJnmXSyVmBe8OD',
		bucket: 'hcoin-idx-fe'
	}
}
const oss_path =  {
	'btb': '//s1.btbcdn.com/',
	'hcoin': '//www.xchspd.com/',
	'tuteng': '//hcoin-idx-fe.oss-cn-hongkong.aliyuncs.com/'
}


module.exports = {
	oss_params,
    oss_path
}