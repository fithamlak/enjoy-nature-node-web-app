const path = require('path')
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const { base } = require('./models/tourModel');

const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// Set http security headers
// 1) Global MIDDLEWARES
// middleware for static path
app.use(express.static(path.join(__dirname, 'public')));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request fro this IP. please try later after an hour'
})

// rate limiter to protect from brute force and DDoS attack
app.use('/api', limter);

// parse req. body and also limit size of paylod(body data to be parsed)
app.use(express.json({limit: '10kb'}));

// mongo sanitize against NoSQl query injection
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

// prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'

  ]
}));


// middleware for testing
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

// middleware for testing
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.get('/', (req, res) => {
  res.status(200).render('base', {
  tour: 'the forrest hiker',
  user: 'Justice'
  })
  
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.use('*', (req, res, next) => {

next(new AppError(`can'nt find ${req.originalUrl} on this server!`));
})

app.use(globalErrorHandler)
module.exports = app;
