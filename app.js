const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) Global MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request fro this IP. please try later after an hour'
})

app.use('/api', limter);
app.use(express.json());
app.use(express.static(`${__dirname}/public`));


app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.use('*', (req, res, next) => {

next(new AppError(`can'nt find ${req.originalUrl} on this server!`));
})

app.use(globalErrorHandler)
module.exports = app;
