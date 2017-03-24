const express = require("express");
const path  = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");
const port =  process.env.PORT;
const hbs = require("express-handlebars");
const mongoose = require("mongoose");

const app = express();
require("dotenv").config();
const url=process.env.MONGOLAB_URI;


// connect to db
mongoose.connect(url,(err)=>{
    if(err) console.log("not connect to db " +err);
    else console.log("connected to db");
});

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// setup middlewares
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
  app.use(require('./routes/index'));

// catch 400 and handle error
app.use((req,res,next)=>{
	const err = new Error("Not Found");
	err.status = 404;
	next(err);
});

// development error handler
if(app.get("env") === "development"){
	app.use((err,req,res,next)=>{
res.status(err.status || 500);
res.render("error",{
	message: err.message,
	error: err
});
	});
}

// production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen to port
app.listen(port,()=>{
console.log("server listening on " + port);
});

module.exports = app;