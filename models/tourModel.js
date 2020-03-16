const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'must be <=100'],
      minlength: [10, 'must be >=10']
      //,      validate: [validator.isAlpha, 'Tour name must  contains  caracters only']
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'must be above 1.0'],
      max: [5, 'must be under 5.0'],
      set: val => Math.round(val * 10) / 10 ///4.666->4.7
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          //this only points to current doc on NEW creation
          return val < this.price;
        },
        message: 'priceDiscount ({VALUE}) must be below regular price'
      }
    },
    duration: {
      type: Number,
      required: [true, 'must have a duration']
    },
    summary: {
      type: String,
      trim: true //remove all white space at the begining and the end of string
    },
    description: {
      type: String,
      trim: true //remove all white space at the begining and the end of string
    },
    imageCover: {
      type: String,
      required: [true, 'must have a cover image']
    },
    images: [String],
    slug: String,
    createdAt: {
      type: Date,
      default: Date.now()
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficult must be either : easy, medium, difficult'
      }
    },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
    startLocation: {
      //geo JSON
      type: { String, default: 'Point', enum: ['Point'] },
      coordinates: ['Number'],
      adress: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: ['Number'],
        adress: String,
        description: String,
        day: Number
      }
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

///define index
tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
//Document middleware :runs before .save() and .create()

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//const User = require('./userModel');

//embeding guides document  into tours document
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

/* 
tourSchema.post('save', function(next) {
  console.log('will save document..');
  next();
}); 
*/

//Query middlewares
//hide seret tours
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start2 = Date.now();
  next();
});
//join (embeding) tours and users using populate  -not recomended in big apps
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt '
  });

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`This query took ${Date.now() - this.start2} ms`);
  next();
});

//Aggregation middleware
tourSchema.pre('aggregate', function(next) {
  ///disabled for geoNear distance
  //  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});

//virtual :we use reg function when we need to use this
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

///virtual population

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
