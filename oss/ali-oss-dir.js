const fs = require('fs');
const path = require('path');
const util = require('util');
const rd = require('rd');
const co = require('co');
const pify = require('pify');

pfs = pify(rd);

/**
 * @param ossClient
 * @constructor
 */
function OssDir(ossClient) {
	const operations = [];

	/**
	 * @param dir
	 */
	this.upload = (dir) => {
		operations.push(dir);
		return this;
	};

	/**
	 * @param callback
	 */
	this.filter = (callback) => {
		operations.push(callback);
		return this;
	};

	/**
	 * @param target
	 */
  	this.to = co.wrap(function*(target, options = {}) {
		let items = [];
		while (operations.length) {
			const operation = operations.shift();

			if (util.isString(operation)) {
				const files = yield pfs.readFile(operation);
				items = items.concat(files.map(file => ({file, dir: operation})));
			}

			if (util.isFunction(operation)) {
				items = items.filter(item => operation(item.file));
			}
		}

		const results = [];
		for (const item of items) {
			const relativePath = item.file.substr(item.dir.length);
			const ossPath = path.join(target, relativePath).replace(/\\/g, '/');
			const result = yield ossClient.putStream(
				ossPath, 
				fs.createReadStream(item.file),
				Object.assign({ timeout: 40 * 1000 }, options)
			);
			yield ossClient.putACL(ossPath, 'public-read');
			results.push(result);
		}
		return results;
	});
}

function ossdir(ossClient) {
	return new OssDir(ossClient);
}

module.exports = ossdir;
