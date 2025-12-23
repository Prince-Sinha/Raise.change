const mongoose = require('mongoose');
const User = require('./userModel');

const postSchema = new mongoose.Schema({
    title : {
        type : String,
        required : [true,'title is Reuired']
    },
    photo :String,
    problemStatement : {
        type : String,
        reuired : [true, 'Describe your Ptoblem' ]
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    status : {
        type : Boolean,
        default : false
    },
    UpVote : {
        type : Number,
        default:1
    },
    State : String,
    city : String,
    user : {
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    },
    dept : {
        type : String,
        enum: ['Municipal Cooperation', 'CyberSecurity Department','Electricity Department'],
        required : true,
    }
    
},{
    toJSON : { virtuals : true},
    toObject : {virtuals : true}
});

// Virtual Populate 
postSchema.virtual('opinions',{
    ref : 'Opinion',
    foreignField : 'post',
    localField : '_id'
});

postSchema.pre(/^find/,function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
})

postSchema.pre('save', function(next){
    this.createdAt = Date.now();
    next();
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;