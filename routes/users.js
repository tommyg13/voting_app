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
  let regex = /^(?=.*?[A-Z])(?=.*?[0-9]).{8,}$/
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
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
  user.save(function(err,user) {
        
      let errors = req.validationErrors();
      let error ="";
    if (err) {
      
      if (err.code === 11000) {
        error = 'That email is already taken, please try another.';
      }
        
      res.render('register',{errors:errors, error:error,csrfToken: req.csrfToken()});
    }else if(req.body.password !== req.body.password2){
        error="Passwords do not match";
    req.session.destroy();
    req.session.reset();
      res.render('register', { errors: errors, error:error,csrfToken: req.csrfToken() });
    } else if (!req.body.password.match(regex)){
        error = 'Password must be at least 6 characters and contain 1 uppercase ';
            req.session.destroy();
    req.session.reset();
      res.render('register', { errors: errors, error:error,csrfToken: req.csrfToken() });
      }
    else {
      server.createUserSession(req, res, user);
    let success="You are successfully registered and loged in";
    res.render('register',{ success,csrfToken: req.csrfToken() });
    }
  });
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
async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        let token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      models.User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
     var options = {
    auth: {
        api_user: 'tommyg13',
        api_key: pass
    }
}
let mailer = nodemailer.createTransport(sgTransport(options));
      let email = {
        to: user.email,
        from: 'thomasgk13@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
     mailer.sendMail(email, function(err) {
        req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.Check also in spam folder');
        done(err, 'done');
      });
    }
      
      ], function(err){
             if (err) return next(err);
    res.redirect('/forgot');

      }
      );
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
  async.waterfall([
    function(done) {
      models.User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(user.email !== req.body.email){

            req.flash('error', 'Email is wrong');
            return res.redirect('back');
}
  if(req.body.password !==req.body.confirm){
     req.flash('error', 'Passwords do no match');
            return res.redirect('back');
  }
    
    let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(req.body.password, salt);
      req.body.password= hash;
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
     
        user.save(function(err) {
            done(err, user);
        });
      });
    },
    function(user, done) {
     var options = {
    auth: {
        api_user: 'tommyg13',
        api_key: pass
    }
} 
      let email = {
        to: user.email,
        from: 'thomasgk13@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      let mailer = nodemailer.createTransport(sgTransport(options));
      
      mailer.sendMail(email, function(err) {
        if(err) console.log(err);
        req.flash('success_msg', 'Success! Your password has been changed.');
        res.redirect('/login');
      });
    }
  ], function(err) {
    res.redirect('/');
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