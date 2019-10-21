const yaml = require('js-yaml');
const fs = require('fs-extra');
const path = require('path');

// process.env.NODE_ENV = 'development';
const getConfigs = function() {
    const configPath = path.resolve(__dirname, 'development.yml');
    try {
        let doc = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));
        return doc;
        
    } catch (e) {
        throw new Error(`不能找到启动配置文件: \n${e}`);
    }
};

const config = global.appCfg = getConfigs();

module.exports = config;