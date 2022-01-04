const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
};

exports.getAllUsers = factory.getAll(User);

exports.getMe = (req, res, next) => {
  //console.log(req.params);
  req.params.id = req.user.id; //current user logged in
  //console.log(req.params);
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1 - Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates.', 400));
  }

  // 2 - filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3 - Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'succes',
    data: {
      user: updatedUser,
    },
  });
});

exports.delteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not definded! Use signup instead',
  });
};

exports.updateUser = factory.updateOne(User); //not for updating
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
