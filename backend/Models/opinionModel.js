const mongoose = require('mongoose');

const opinionSchema = new mongoose.Schema({
    
    opinion :{
        type : String,
        required : [true,'Opinion is Required']
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    post : {
        type: mongoose.Schema.ObjectId,
        ref : 'Post',
        required : [true,'Required Post Id']
    },
    user : {
        type: mongoose.Schema.ObjectId,
        ref : 'User',
        required : [true,'Required User Id']
    },
},{
    toJSON : {virtuals:true},
    toObject : {virtuals: true}
});

opinionSchema.pre(/^find/,function(next){
    this.populate({
        path : 'post',
        select : '_id name'
    }).populate({
        path : 'user',
        select : 'name photo'
    });
    next();
})

const Opinion = mongoose.model('Opinion', opinionSchema);

module.exports = Opinion;