const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      set: val => Math.round(val * 10) / 10
    },
    createdAt: { type: Date, default: Date.now() },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must be belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must be belong to a user.']
    }
  },
  {
    toJSON: { virtuals: true }, ///
    toObject: { virtuals: true }
  }
);
///prevente review duplications
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: ['name', 'photo']
  });
  //   this.populate({
  //     path: 'tour',
  //     select: 'name'
  //   });

  next();
});

reviewSchema.statics.calcAvrageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: stats[0].avgRating,
      ratingQuantity: stats[0].nRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: 4.5,
      ratingQuantity: 0
    });
  }
};

//save
//>doc midlware
reviewSchema.post('save', function() {
  //points to current review
  this.constructor.calcAvrageRatings(this.tour);
  ///next(); in post we hanvt access to next
});

//findByIdAndUpdate
//findByIdAndDelete
//->query middleware
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  //console.log(this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does not work here,because the query is already executed
  if (this.r) this.r.constructor.calcAvrageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
