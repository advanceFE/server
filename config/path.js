const path = require('path')
const util = require('../lib/util')

module.exports = {
	base: util.isOnline ? '/home/www/': '/Users/sunlvte/Sites/bt/', //
	dev: 'dev/',
	gray: 'gray/',
	repo: 'repo/',
	prod: 'prod/'
}