const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    mail: {
        type: String,
        unique: true,
        require: true
    },
    token: String,
    password: {
        type: String,
        require: true
    },
    lastLoginTime: {
        type: Date,
        default: Date.now
    }
})

/**
 * 添加用户保存时中间级对pwd进行bcrypt加密
 */
UserSchema.pre('save', async function (next) {
    // 如果密码改过或者是一个新user则加盐
    if (this.isModified('password') || this.isNew) {
        let salt = await bcrypt.genSalt(10);
        let pwdHash = await bcrypt.hash(this.password, salt);
        this.password = pwdHash;
    }
    next();
})

/**
 * 校验用户输入密码是否正确
 */
UserSchema.methods.comparePassword = function(pwd) {
    return bcrypt.compareSync(pwd, this.password);
}


module.exports = mongoose.model('User', UserSchema);