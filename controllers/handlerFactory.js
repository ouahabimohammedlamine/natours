const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIfeatures = require('../utils/apiFeatures');

exports.getAll = (Model, populateOptions) =>
  catchAsync(async (req, res) => {
    //To allow for nested GET reviews on tour(HACK)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();
    //exec the query

    if (populateOptions)
      features.query = features.query.populate(populateOptions);

    const docs = await features.query; ///add .explain() for query stats

    //send response
    res.json({
      status: 'success',
      /// requestTime: req.requestTime,
      result: docs.length,
      data: {
        docs
      }
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query; ///
    //console.log(`tour ${tour}`);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: { data: newDoc } });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID!'));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
exports.updateOne = Model =>
  catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      useFindAndModify: false,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      data: {
        data: doc //when we have tour:tour we can use tour in es6
      }
    });
  });
