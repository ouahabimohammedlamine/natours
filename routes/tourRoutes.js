const express = require('express');
const tourController = require('./../Controllers/tourController');
const authController = require('./../Controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const route = express.Router();
//route.param('id', tourController.checkID);

///redirect to review router
route.use('/:tourId/reviews', reviewRouter);
route
  .route('/tours-within/distance/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
route.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

/// /tours-within/distance/100/center/31.623563,-2.192970/unit/km

route
  .route('/top-5-cheap')
  .get(tourController.aliasTopCheapTours, tourController.getAllTours);

route
  .route('/Monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

route.route('/tour-stats').get(tourController.getToursStat);

route
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
//  .post(tourController.checkBody, tourController.addTour);
route
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = route;
