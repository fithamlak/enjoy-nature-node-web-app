const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Can not be empty']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'review should be belong to tour']
  },
  user: {
    type:mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'review must belong to a user']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
);
reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // })
  this.populate({
      path: 'user',
      select: 'name photo'
    })
  next();
});  
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;