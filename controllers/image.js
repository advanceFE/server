const co = require('co');
const client = require('../oss/index');
const config = require('../config/index');
const Image = require('../models/image');

class ImageController {
    async getImageList (ctx, next) {
        let imageList = [];
        await Image.find({}, function(err, res){
            if (!err) {
                imageList = res;
            }
        }).limit(10);
        ctx.body = {
            code: 0,
            entry: imageList
        }
    }
    async uploadImage (ctx, next) {
        var fileObj = ctx.req.file,
            image = new Image(),
            imgPath = `img/${fileObj.filename}`;
        image.imgName = fileObj.filename;
        image.save();
        co(function* () {
            const ossObj =  client.ossObj();
            const bucket =  (config.oss_params['btb'] || config.oss_params['btb']).bucket;
            ossObj.useBucket(bucket);
            let result = yield ossObj.put(imgPath, fileObj.path);
            yield ossObj.putACL(imgPath, 'public-read');
        }).catch(function (err) {
            console.log(err);
        });
        ctx.body = {
            code: 0
        }
    }
}

module.exports = new ImageController();