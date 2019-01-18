const createError = require('http-errors');
const express = require('express');
// 引入mongoose
const mongoose = require('mongoose');
// 数据库地址，格式：mongodb://your_username:your_password@your_dabase_url
const mongoDB = 'mongodb://waka:2m2KnFZHMSMTQ6Z@ds119660.mlab.com:19660/local-library';
// 连接数据库
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const stylus = require('stylus');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// 使用stylus中间件将stylus编译成css
app.use(stylus.middleware({
  src: path.join(__dirname, 'public', 'stylus'),
  dest: path.join(__dirname, 'public', 'css'),
  force: true,
  compress: 'compress'
}))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
