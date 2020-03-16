const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  //1- Get tour data from the collection
  const tours = await Tour.find();

  //2- Build the templete

  //3- Render that templete using tour data from 1-

  res.status(200).render('overview', {
    // user: res.local.user,
    title: 'All tours',
    tours: tours
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  //1- get tour from slug

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review ratig user'
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).render('tour', { title: tour.name, tour });
});

exports.login = catchAsync(async (req, res, next) => {
  //1- get tour from slug

  /*   const tour = await Tour.find({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review ratig user'
  });
  if (!tour) {
    return next(new AppError('incorrect url', 404));
  } */
  res.status(200).render('login', { title: 'login' });
});
exports.getTour = catchAsync(async (req, res, next) => {
  //1- get tour from slug

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review ratig user'
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).render('tour', { title: tour.name, tour });
});

exports.me = catchAsync(async (req, res, next) => {
  //1- get tour from slug

  /*   const tour = await Tour.find({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review ratig user'
  });
  if (!tour) {
    return next(new AppError('incorrect url', 404));
  } */
  res.status(200).render('account', { title: 'my account' });
});
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  if (!updatedUser) {
    return next(new AppError('Please login first.', 401));
  }
  //res.status(200).redirect('/me');
  res.status(200).render('account', { title: 'my account', user: updatedUser });
});
