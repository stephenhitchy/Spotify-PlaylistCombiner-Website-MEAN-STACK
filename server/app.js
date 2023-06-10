var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var apiRouter = require('./routes/api');
var authRouter = require('./routes/auth');

var app = express();

let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/spotifyApp', {
  useNewUrlParser : true
});

app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

var MongoDBStore = require('connect-mongodb-session')(session);

let mongoSessionStore = new MongoDBStore( {
  uri: 'mongodb://localhost:27017/',
  collection: 'sessions'
});

app.use(session({
  secret: 'faskdj]fhladsf',
  resave: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: false,
    maxAge: 1000 * 100,
    csrfToken: ''
  },
  name: 'sid',
  rolling: true,
  store: mongoSessionStore
}));

app.use('/', authRouter);
app.use('/api/v1', apiRouter);

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
  res.json( err );
});

module.exports = app;
