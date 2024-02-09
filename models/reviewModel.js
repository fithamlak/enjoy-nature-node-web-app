const mongoose = require('mongoose');
const Tour = require('./tourModel')
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

reviewSchema.index({ tour: 1, user: 1}, { unique: true})
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

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: {tour: tourId}
    },
    {
      $group: {
        _id: '$tour',
        nRating: {$sum: 1},
        avgRating: { $avg: '$rating'}
      }
    }
  ])
  console.log(stats)
  if(stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    
    })
  } else{
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    
    })
  }  
}

reviewSchema.post('save', function()  {
  //this points to current review
  this.constructor.calcAverageRatings(this.tour)
})

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOne/, async function(next) {
  this.r = await this.findOne()
  next()
})

reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r)
})
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;