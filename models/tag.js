const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost:27017/tagdb', {useMongoClient: true});

const modelSchma = new Schema({
    group: {
        type: String,
        require: true
    },
    repo: {
        type: String,
        require: true
    },
    tag: {
        type: String,
        require: true
    },
    // 最新一次发布时间
    time: {
        type: String,
        default: Date.now(),
        require: true
    },
    userEmail: {
        type: String,
        require: false
    },
    buildLog: {
        type: String,
        require: false
    },
    buildTime: {
        type: String,
        require: false
    }
})
const model = mongoose.model('tagdb', modelSchma);
const promise = (action, ...arg) => {
    return new Promise((resolve, reject) => {
        arg.push((err, data) => {
            if (err) {
                return reject(err)
            } else {
                return resolve(data)
            }
        })
        model[action].apply(model, arg)
    })
}

// 官方自带的promise疑似有bug，实际上已经触发then的操作了，但是数据并未修改成功
/**
 * 调用方法
    promise('find', {group: 'zhouxiaojiang', repo: 'btb-web'})
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })
*/
module.exports = {
    model,
    promise
}

// model.update({group: 'zhouxiaojiang', repo: 'btb-web'}, {group: 'zxj', repo: 'btb-web2'})
//  .then(data => {
//      console.log(data)
//  })

// model.find({})
//  .then(data => {
//      console.log(data)
//      data.group = 'zxj'
//  })

// .update({title: "Mongoose"}, {author: "L"}, {multi: true}, function(err, docs){
//     if(err) console.log(err);
//     console.log('更改成功：' + docs);
// })
// var newRepo = new model({
//     group: 'zhouxiaojiang',
//     repo: 'btb-web',
//     // 当前发布的tag
//     tag: '0.2.2',
//     // 最新一次发布时间
//     time: Date.now(),
//     publisher: 'zhouxiaojiang'
// })

// newRepo.save()
//     .then(res => {
//         console.log('success')
//         console.log(res)
//     })
//     .catch(err => {
//         console.log(err)
//     })

// model.find({group: 'zhouxiaojiang', repo: 'btb-web'}, (err, data) => {
//  console.log(data)
// })
// newRepo.save(function(err, data){
//     if(err){ return console.log(err) }
//     repoModel.find(function(err, data){
//      if(err){ return console.log(err) }
//      console.log(data)
//   })
// })
// model.find({group: 'zhouxiaojiang', repo: 'btb-web'}, (err, data) => {
//     console.log(data)
// })

