const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')



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

exports.createReview = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
