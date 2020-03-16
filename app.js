const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
require('ejs');

const AppError = require('./utils/appError');
const globErrorHandler = require('./utils/errorHandler');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
//Setting up pug
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));
//--------- 3rd-party  middelware---------

//set securety HTTP headers
app.use(helmet());

//Limit  requests to the same API
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_MINUTES * 60 * 1000, // (RATE_LIMIT_MINUTES) minutes
  max: process.env.MAX_REQUESTS, // limit each IP to (MAX_REQUESTS) requests per windowMs,
  message: 'Too many requests,please ty aqain later.'
});

app.use('/api', limiter);

//Body parser ,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());
//protect against HTTP Parameter Pollution attacks
app.use(hpp({ whitelist: ['duration', 'price', 'difficulty'] }));
//Data sanitization against Nosql query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//enable/disable debug infos
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//--------- Own  middelware---------------

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(`hello from the middleware!!${req.requestTime}`);
  // console.log(req.cookies);
  next();
});
//---------------------------------------

// routes

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewRouter);

//Handeling unhandled Routes
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl}  on this server`, 404));
});
app.use(globErrorHandler);

module.exports = app;
