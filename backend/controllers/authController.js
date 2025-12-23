const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const User = require('./../Models/userModel.js');
const {promisify} = require('util');
const sendEmail = require('./../utils/email.js');
const crypto = require('crypto');

const signToken = (id)=>{
    return jwt.sign({ id : id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRE_IN
    });
}

exports.signup = catchAsync(async (req,res,next)=>{
    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        phoneNumber : req.body.phoneNumber,
        password : req.body.password,
        ConfirmPassword : req.body.ConfirmPassword,
        role :req.body.role,
        city : req.body.city,
        State : req.body.State,
        address : req.body.address
    });

    const token = signToken(newUser._id);
    const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
    res.cookie('jwt',token,cookieOptions);
   
    res.status(201).json({
        status : 'success',
        token,
        user : newUser
    });
    
});

exports.login = catchAsync(async (req,res,next)=>{
    const {phoneNumber,password}= req.body;

    if(!phoneNumber || !password){
        return next(new AppError(`Please Provide ${!phoneNumber?'phoneNumber':'password'}`,404));
    }

    const user = await User.findOne({phoneNumber}).select('+password');

    if (!user || !(await user.CorrectPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
      }

    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
    res.cookie('jwt',token,cookieOptions);

    // Remove Password from the Output
     user.password = undefined;


    res.status(200).json({
        status :'success',
        token,
        data : {
            user
        }
    })

});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email address.', 404));
    }
  
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
  
    // 3) Send it to user's email
    try {
    //   const resetURL = `${req.protocol}://${req.get(
    //     'host'
    //   )}/api/v1/users/resetPassword/${resetToken}`;
    //   await new Email(user, resetURL).sendPasswordReset();
    //    console.log(resetToken);
  
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
  
      return next(
        new AppError('There was an error sending the email. Try again later!'),
        500
      );
    }
});

exports.resetPassword = catchAsync(async (req,res,next)=>{
     const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
     const user = await User.findOne({
        passwordResetToken : hashedToken,
        passwordResetExpire : { $gt : Date.now()}
     });

     if(!user){
        return next(new AppError('Token is invaild or has expired'));
     }

     user.password = req.body.password;
     user.ConfirmPassword = req.body.ConfirmPassword;
     user.passwordResetExpire=undefined;
     user.passwordResetToken = undefined;
     await user.save();

     const token = signToken(user._id);
     const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
    res.cookie('jwt',token,cookieOptions);
     res.status(200).json({
        status :'success',
        token,
        data : {
            user
        }
     });
});

exports.protect = catchAsync(async (req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }

    if(!token){
        return next(new AppError('You are not logged in.Please log in to access',401));
    }

    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECERT);

    const newUser = await User.findById(decoded.id);
    if(!newUser){
        return next(new AppError('User belonging to this token do not exist',401));
    }

    if(newUser.ChangedPasswordAfter(decoded.iat)){
        return next(new AppError('User Changed the Password Please login again',401));
    }

    req.user = newUser;
    next();
});

exports.isLoggedIn= catchAsync(async (req,res,next)=>{
    let token;
    if(req.cookies.jwt){
        token = req.cookies.jwt;
        const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECERT);

        const newUser = await User.findById(decoded.id);
        if(!newUser){
            next();
        }

        if(newUser.ChangedPasswordAfter(decoded.iat)){
            return next();
        }
        
        res.locals.user = newUser
        next();
   }
   next();
});


exports.restrictTo = function(...roles){
    return (req,res,next)=>{
        if(roles != 'public'){
            return next(new AppError("You do'nt have permission to perform this",403))
        }
        next();
    };
};
