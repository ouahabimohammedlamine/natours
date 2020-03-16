class AppError extends Error {
  constructor(message, statusCode) {
    //when extends use supper to call the parent constructor
    super(message);
    //this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    //console.log(this.message);

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
