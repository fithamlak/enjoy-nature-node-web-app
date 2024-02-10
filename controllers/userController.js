const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')

const filterObj = (obj, ...allowFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(allowFields.includes(el)) {
     newObj[el] = obj[el];
    }
  });
  return newObj;
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id

  next()
}
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log('am touched')
  // 1) create error if user posts password data
  if(req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not password updates. please use /updateMyPassword', 400));
  }
  // 2) filtered out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email')

  // 3) update document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new: true, runValidators: true})
  console.log('am touched')
  console.log(updatedUser);

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser
    }
  });


});

exports.deleteMe = catchAsync(async(req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active: false});

  res.status(204).json({
    status: 'success',
    data: null
  })
})

  exports.createUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined! please use /signup instead'
    });
  };

  exports.getUser = factory.getOne(User)
  exports.getAllUsers = factory.getAll(User)
  // Do not use to update password only to update user data
  exports.deleteUser = factory.deleteOne(User);
  exports.updateUser = factory.updateOne(User);