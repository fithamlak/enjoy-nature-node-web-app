const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')



exports.getAllReview = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query)
    // .filter()
    // .populate('tour', 'user')
    // .sort()
    // .limitFields()
    // .paginate();
  const review = await features.query;

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

  const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview
      }
    });
});

