const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalide ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldDB = err => {
  const message = `Duplicate value: '${err.keyValue.name}' `;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const error = Object.values(err.errors).map(el => el.message);
  const message = `Invalide input data. ${error.join('. ')}`;
  return new AppError(message, 400);
};
const handleJsonTokenError = () => {
  return new AppError('Please login again!', 401);
};
const handleTokenExpiredError = () => {
  return new AppError('token expired,Please login again!', 401);
};

const sendErrorDev = (err, res, req) => {
  console.log('dev ', err.message);

  //API errors
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack
    });
  }
  //Rendering website error
  res.status(err.statusCode).render('error', {
    title: err.statusCode,
    message: err.message
  });
};
const sendErrorProduction = (err, res, req) => {
  //operational error
  if (err.isOperational) {
    // API error
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message || 'error'
      });
    }
    //Rendering website
    return res.status(err.statusCode).render('error', {
      title: err.statusCode,
      message: err.message
    });
  }

  //unknown errors : don't leak error details to clients
  console.log(`error ${err}`); //useful for log errors in the server
  // API error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong!'
    });
  }
  //Rendering website error
  return res.status(err.statusCode).render('error', {
    title: 'SomeThing went wrong!',
    message: 'Please try again later.'
  });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res, req);
  } else if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };

    //costumizing mongodb & mongoose error messages
    //1-invalid ID
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    //2-duplicate val
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    //3-validation error
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    //4-JsonWebTokenError error
    if (error.name === 'JsonWebTokenError') error = handleJsonTokenError(error);
    //4-handle Token Expired error
    if (error.name === 'TokenExpiredError')
      error = handleTokenExpiredError(error);

    sendErrorProduction(err, res, req);
  }
};
