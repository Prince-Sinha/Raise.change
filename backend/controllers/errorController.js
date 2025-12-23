const { error } = require('console');
const AppError = require('./../utils/appError')

const sendErrorDev = (err,res)=>{
    res.status(err.StatusCode).json({
        status : err.status,
        error : err,
        message : err.message,
        stack : err.stack
    });
};

const sendErrorProd = (err,res)=>{
    if(err.isOperational){
     res.status(err.StatusCode).json({
        status : err.status,
        message : err.message
     });
    }else{
        console.error('ERROR ', err);

        res.status(500).json({
            status : 'fail',
            message : 'Something went wrong!'
        })
    }
};

const handleCastErrorDB = err=>{
    const message = `Invalid ${err.path} : ${err.value}`
    return new AppError(message,400)
}
const handleDuplicateFieldDB = err=>{
    const name = err.keyPattern.email?'email':'phoneNumber';
    
    const message = `Dupilcate ${name}.Please try with another one`;
    return new AppError(message,400)
}

const handeleValidationErrorDB = err=>{
    // const error = Object.values(err.errors).map()
    const message = `Invalid input data : ${err.message}`;
    return new AppError(message,400);
}

module.exports = (err,req,res,next)=>{
    err.StatusCode = err.StatusCode || 500
    err.status = err.status || 'error'

    if(process.env.NODE_ENV ==='development'){
        sendErrorDev(err,res)
        
    }else if(process.env.NODE_ENV === 'production'){
        let error = { ...err};
        if(err.name === 'CastError') error = handleCastErrorDB(error);
        if(err.code === 11000) error = handleDuplicateFieldDB(error);
        if(err.name === 'ValidationError') error = handeleValidationErrorDB(error);

        sendErrorProd(error,res);

    }
}