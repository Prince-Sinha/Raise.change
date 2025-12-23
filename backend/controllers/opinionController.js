const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Opinion = require('../Models/opinionModel');

exports.getallOpinion = catchAsync(async (req,res,next)=>{
    const opinions = await Opinion.find();

    res.status(200).json({
        status :'success',
        data : {
            opinions
        }
    });
});

exports.createOpinion = catchAsync(async (req,res,next)=>{
    const newopinion = await Opinion.create(req.body);

    res.status(201).json({
        status :'success',
        data : {
            newopinion
        }
    });

});