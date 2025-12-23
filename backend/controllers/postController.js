const Post = require('./../Models/postModel');
const User = require('./../Models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');


exports.unresolvedPost = catchAsync(async (req,res,next)=>{
    const unresPosts = await Post.find({ status : false}).populate({
        path : 'opinions',
        fields : 'opinion'
    });


    if(!unresPosts){
        return next(new AppError('Every Issuse has been resolved',404))
    }

   
    res.status(200).json({
        status : 'success',
        result : unresPosts.length,
        data : {
            post : unresPosts
        }
    });
})

exports.resolvedPost = catchAsync(async (req,res,next)=>{
    const resPosts = await Post.find({status : true}).populate({
        path : 'opinions',
        fields : 'opinion'
    });
    if(!resPosts){
        return next(new AppError('No Resolved Issuse',404));
    }
    res.status(200).json({
        status : 'success',
        result : resPosts.length,
        data : {
            post : resPosts
        }
    })
})

exports.getonePost = catchAsync(async (req,res,next)=>{
    const post = await Post.findById(req.params.id).populate({
        path :'opinions',
        fields :'opinion createdAt'
    });
    if(!post){
        return next(new AppError('No post found with this id'),404);
    }

    res.status(200).json({
        status: 'success',
        data : {
            post
        }
    })
});


exports.createPost = catchAsync(async (req,res,next)=>{
    const newPost = await Post.create(req.body);
    res.status(201).json({
        status : 'success',
        data : {
            post : newPost
        } 
    });
});

exports.updatePost = catchAsync(async (req,res,next)=>{
    const post = await Post.findByIdAndUpdate(req.params.id,req.body,{ new : true,runValidators: true});

    if(!post){
        return next(new AppError('No post found with this Id',404));
    }

    res.status(200).json({
        status : 'success',
        data : {
            tour
        }
    });
});

exports.deletePost = catchAsync(async (req,res,next)=>{
    await Post.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status : 'success',
        data : null
    })
});