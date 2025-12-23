const User = require('./../Models/userModel');
const Post = require('./../Models/postModel')
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.getUser = catchAsync(async (req,res,next)=>{

    const user = await User.findById(req.params.id);
    if(!user){
        next(new AppError('No User Found',404));
    }

    res.status(200).json({
        status: 'success',
        data : {
            user
        }
    })
});

exports.getPost = catchAsync(async (req,res,next)=>{
    const post = await  Post.find({ user : req.params.id }); 

    if(post.length == 0){
        return next(new AppError('You have not posted any thing',404));
    }

    res.status(200).json({
        status : 'success',
        data : {
            post
        }
    })
});


exports.updateOne = catchAsync(async (req,res,next)=>{
    
    const filterBody = filterObj(req.body,'supported','address');
    if(req.file) filterBody.photo = req.file.filename
    const updated = await User.findByIdAndUpdate(req.params.id,req.body,{ new : true,runValidators: true});

    if(!updated){
        return next(new AppError('No user found',404));
    }

    res.status(200).json({
        status : 'success',
        data : {
            user : updated
        }
    });
});