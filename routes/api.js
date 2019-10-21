const Router = require('koa-router');
const execFileSync = require('child_process').execFileSync;
const path = require('path');
const multer = require('koa-multer');
const crypto = require('crypto');
const mime = require('mime');
const UserController = require('../controllers/user');
const ImageController = require('../controllers/image');
const HookController = require('../controllers/hook');
const DDController = require('../controllers/ding');



const router = new Router();


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function(req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(err, err ? undefined : `${raw.toString('hex')}.${mime.getExtension(file.mimetype)}`)
        })
    }
});
const upload = multer({ storage });



router.post('/login', UserController.login);
router.post('/upload', upload.single('file'), ImageController.uploadImage);
router.get('/getImgList', ImageController.getImageList);
router.post('/web-hook', HookController.uploadToOSS.bind(HookController));
router.post('/getJwt', DDController.getJwt);

module.exports = router;