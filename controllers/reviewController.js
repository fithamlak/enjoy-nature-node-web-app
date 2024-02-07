const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')



exports.getAllReview = catchAsync(async (req, res, next) => {

  let filter = {};
  if(req.params.tourId) filter = {tour: req.params.tourId}
  
  const review = await Review.find(filter)

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: review.length,
    data: {
      review
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested route
  if(!req.body.tour) req.body.tour = req.params.tourId;
  if(!req.body.user) req.body.user = req.user.id;
  const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview
      }
    });
});

