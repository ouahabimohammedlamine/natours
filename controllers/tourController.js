const factory = require('./handlerFactory');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopCheapTours = (req, res, next) => {
  req.query.sort = '-ratingAverage,price';
  req.query.limit = '5';
  next();
};

exports.getToursStat = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } }
    },

    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //group by null:all,  difficulty
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: -1 }
    } /* ,
    {
      $match: { _id: { $ne: 'EASY' } }
    } */
  ]);
  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    message: stats
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  console.log(year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },

    {
      $addFields: { month: '$_id' }
    },

    {
      $sort: { month: 1 }
    },

    {
      $limit: 10
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan }
  });
});
exports.getToursWithin = catchAsync(async (req, res, next) => {
  // /tours-within/distance/100/center/31.623563,-2.192970/unit/km

  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; ///convert distance to radian
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude & longitude in the format lat , lng',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng * 1, lat * 1], radius]
      }
    }
    //{startLocation: {$geoWithin: { $centerSphere: [ [ -107.08106177239752, 39.66580108452081 ], 0.14295351740231926 ]}}}
  });
  if (!tours || tours.length === 0) {
    return next(new AppError('No tours found !', 404));
  }
  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: { data: tours }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  ///
  const unitMultiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude & longitude in the format lat , lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: unitMultiplier
      }
    }, /// using projection to specify fields to show
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { data: distances }
  });
});
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.getAllTours = factory.getAll(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
