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
exports.setTourUserIds = (req, res, next) => {
  if(!req.body.tour) req.body.tour = req.params.tourId
  if(!req.body.user) req.body.user = req.params.user

  next()
}
exports.createReview = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
