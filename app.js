var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cookieSession = require('cookie-session')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articleRouter = require('./routes/article');
var manageRouter = require('./routes/manage');
var notesRouter = require('./routes/notes');
var messageRouter = require('./routes/message');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('123456'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(cookieSession({
  name: 'session_id',
  keys: ['123456'],
  secret: 'keyboard cat',

  // Cookie Options
  maxAge: 60 * 60 * 60 * 1000
}))

// 处理跨域请求
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header('Access-Control-Allow-Headers', 'Content-type');
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS,PATCH");
  res.header('Access-Control-Max-Age',1728000);// 预请求缓存20天
  res.header("Access-Control-Allow-Credentials",true);
  res.header("Content-Type", "application/json;charset=utf-8");
  next();  
});

// app.disable('etag'); // 从缓存中返回数据

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/article', articleRouter);
app.use('/manage', manageRouter);
app.use('/notes', notesRouter);
app.use('/message', messageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// 处理跨域请求时应注释 404 ,暂时还没验证
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
