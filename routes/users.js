"use strict";
const express = require("express");
const bcrypt = require("bcryptjs");
const models = require("../models/model");
const server = require("../server");
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const async = require('async');
const crypto = require('crypto');
const router = express.Router();
const {mailerSend} = require("./mailer");

require("dotenv").config();
const pass=process.env.PASS;

/* Get register page */
router.get("/register",(req,res)=>{
   res.render("register",{csrfToken: req.csrfToken()}); 
});

/* Crete new user account */
router.post('/register', function(req, res) {
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(req.body.password, salt);
  let hash1 = bcrypt.hashSync(req.body.password2, salt);
  let user = new models.User({
    username:  req.body.username,
    email:      req.body.email,
    password:   hash,
    password2:  hash1
  });
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password', 'Password must be at least 6 characters').isLength({min:6});
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
  // handle the errors
      var errors = req.validationErrors();
if(errors){
  
    req.session.destroy();
    req.session.reset();
      res.render('register', { errors: errors,csrfToken: req.csrfToken() });
    }
    
  // if not errors save user on db  
    else {
       user.save(function(err,user) {
      let errors = req.validationErrors();
      let error ="";
    // handle duplicates on username and email
    if (err) {
      let EmailErr=err.message.slice(0,68);
      if(EmailErr=="E11000 duplicate key error index: trade_book.users.$email_1 dup key:"){
         error = 'That Email is already taken, please try another.';
      }
      res.render('register',{title:"Register",errors:errors, error:error,csrfToken: req.csrfToken()});
    }
    
    // redirect user on login pag
    else{
      req.flash('success_msg', 'You are successfully registered and can now logged in');
       res.redirect('/login');
        server.createUserSession(req, res, user);
    }
       });
     
    }
});

/* Get login page */
router.get("/login",(req,res)=>{
   res.render("login",{csrfToken: req.csrfToken()});
});

/**
 Log a user into their account.
 Once a user is logged in, they will be sent to the dashboard page.
 */
router.post("/login",(req,res)=>{
   models.User.findOne({email: req.body.email}, "username email password",(err,user)=>{
      if(!user){
          res.render("login",{"error":"User does not exist ",csrfToken: req.csrfToken()});
      }else {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        server.createUserSession(req, res, user);
        res.redirect('/');
        
      }else {
        res.render('login', { "error": "Incorrect email or password.",csrfToken: req.csrfToken()});
      }
      }
   });
});

/* Get forgot password page */
router.get("/forgot",(req,res)=>{
   res.render("forgot",{csrfToken: req.csrfToken()});
});

/* Handle forgot password */
router.post("/forgot",(req,res,next)=>{
 models.User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

bcrypt.hash('bacon', 16, function(error, hash) {
        hash= hash.split(".").join("").split("/").join("");
        user.resetPasswordToken = hash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save((err,d)=>{
          if(err) console.log(err);
          else {
        let host=req.headers.host;
        let message='You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://' + host + '/reset/' + hash + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        let subject= "Password Reset";
          mailerSend(user,host,subject,message);
          }
        });
});        
      });
        req.flash('success_msg', 'An e-mail has been sent to ' + req.body.email + ' with further instructions.Check also in spam folder');      
      res.redirect("/forgot");
});

/* render reset page*/
router.get('/reset/:token', function(req, res) {
  models.User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset',{csrfToken: req.csrfToken()});
  });
});

/* handle reset */
router.post('/reset/:token', function(req, res) {
  models.User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    let errors=[];
    if (!user) {
      errors.push({msg:'Password reset token is invalid or has expired.'});
    }
    if(user.email !== req.body.email){
    errors.push({msg:'Email is wrong'});      
    }
    if(req.body.password !==req.body.confirm){
    errors.push({msg:'Passwords do no match'});
  }
    if(req.body.password.length <6 ){
    errors.push({msg:'Password must be at least 6 characters'});      
  }
  if(errors.length > 0) {
    req.flash('errors', errors);
    res.render('reset', { errors: errors,csrfToken: req.csrfToken() });    
  }
    else {
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(req.body.password, salt);
      req.body.password= hash;
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.save();
        let host=req.headers.host;
        let message='Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
          let subject= "Your password has been changed";
          mailerSend(user,host,subject,message);
        req.flash('success_msg', 'Success! Your password has been changed.');
        res.redirect('/login');          
    }
  });
});

/**
 * Log a user out of their account, then redirect them to the login page.
 */
router.get('/logout', function(req, res) {
  
  if (req.session) {
    req.session.destroy();
    req.session.reset();
  }
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});

module.exports = router;