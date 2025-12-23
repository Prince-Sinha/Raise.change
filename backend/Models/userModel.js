const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Post = require('./postModel')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Name is Required']
    },
    email :{
        type : String,
        validate : [validator.isEmail,'Not valid Email'],
        required : [true,'Email is Required'],
        unique : true
    },
    phoneNumber : {
        type : Number,
        required : [true,'Number is Required'],
        unique : true,
        validate : {
            validator : function(val){
                return `${val}`.length === 10
            },
            message : 'Number is not valid. Please Check again!'
        }
    },
    password : {
        type : String,
        minlength : 8,
        required : [true, 'Password is Required'],
        select : false
    },
    ConfirmPassword : {
        type : String,
        required : [true, 'Required '],
        validate : {
            validator : function(val){
                return this.password === val
            },
            message : 'Not matched with Password'
        }
    },
    photo : String,
    role : {
        type : String,
        enum : ['public','dept'],
        default : 'public'
    },
    passwordChangedAt : {
        type : Date
    },
    passwordResetToken : String,
    passwordResetExpire : Date,
    photo : String,
    city : {
        type : String,
        required : [true,'City is Required'],
    },
    State : {
        type : String,
        required : [true, 'State is Reuired']
    },
    address :{
      type : String,
      required : [true,'Address is required']
    },
    supported : [
        {
            type : mongoose.Schema.ObjectId,
            ref: 'Post'
        }
    ]
},{
        toJSON : { virtuals : true},
        toObject : {virtuals : true}
});

// Virtual Populate 
userSchema.virtual('posts',{
    ref : 'Post',
    foreignField : 'user',
    localField : '_id'
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);
    this.ConfirmPassword = undefined;
    next();

    
});



userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    
    this.passwordChangedAt = Date.now()-1000;
    next();
});

// userSchema.pre('save', async function(next){
//     const supPromise = this.supported.map(async el => await Post.findById(el));
//     this.supported= await Promise.all(supPromise);
//     next();
// })

// userSchema.pre(/^find/,function(next){
//     this.populate({
//         path:'supported',
//         select : '-__v'
//     })
// })

userSchema.methods.CorrectPassword = async function(actualPassword, givenPassword){
    return await bcrypt.compare(actualPassword,givenPassword);
}

userSchema.methods.ChangedPasswordAfter = function(Time){
   if(this.passwordChangedAt){
    const time = parseInt(this.passwordChangedAt.getTime()/1000,10);
    return (Time < time);
   }
   return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpire = Date.now() + 10*60*1000;
    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports= User;