const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    // mail: {
    //     type: String,
    //     require: true
    // },
    imgName: {
        type: String,
        require: true
    }
})


module.exports = mongoose.model('Image', ImageSchema);