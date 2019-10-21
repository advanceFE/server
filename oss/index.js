const OSS = require('ali-oss');
const configPath = require('../config/index')
const log = require('../lib/log');

module.exports = {
    ossObj: (params= 'btb') => {
    	const data = configPath.oss_params[params] || configPath.oss_params['btb']
	    return new OSS(data)
    },
    path: (tar = 'btb') => {return configPath.oss_path[tar] || configPath.oss_path['btb']}
};