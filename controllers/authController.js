const crypto = require('crypto')
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
})
}
exports.signup = catchAsync(async(req, res, next) => {
  const newUser = await User.create(req.body);


  const token = signToken(newUser._id)
  res.status(201).json({
    status: 'success',
    token,
    data: {
        User: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } =req.body;

  // 1) check if email and password exist

  if(!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }

  // 2) check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  
  if(!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError('incorrect email or password, 401'))
  }


  // 3) if everything okaysend token to client
  const token = signToken(user._id)
  res.status(200).json({
    status: 'success',
    token: token
  })
});

exports.protect = catchAsync( async(req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if(!token) {
    return next(new AppError('You are not loged in! please login to get this access.', 401));
  }
  // 2) Verification token
  const decodded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  console.log(decodded)
  // 3) check if user still exist
  
  const currentUser = await User.findById(decodded.id) 
  if(!currentUser) {
    return new AppError('The user belongig to this token, doesnot loneger exist', 401)
  }

  // 4) Check if user changed password after the token was issued

    if(currentUser.changedPasswordAfter(decodded.iat)){
      return next(new AppError('User recently changed his password! please login again'), 401)
    }

   // Grant access to protrcted route
   req.user = currentUser; 
  next();
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
   if(!roles.includes(req.user.role)) {
    return next(new AppError('You are not alllowed to perform this operation', 403))
   }

   next();
  }
}

exports.forgotPassword = catchAsync( async(req, res, next) => {
  // 1) get user based on Posted email
  const user = await User.findOne({email: req.body.email})

  if(!user) {
    return next(new AppError('There is not user found with this email', 404))
  }
  // 2) Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false});

  // 3) send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
)}/api/v1/users/resetPassword/${resetToken}`;
const message = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to:
${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

try {
  await sendEmail({
    email: user.email,
    subject: 'Your password reset token (valid for 10 min',
    message
  });

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email'
  });
} catch (err) {
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false})

  return next(
    new AppError('There was an error sending the email. Try again later!'),
  );  
}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}})

  if(!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.save();

  const token = signToken(user._id)
  res.status(200).json({
    status: 'success',
    token: token
  })
})