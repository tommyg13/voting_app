const nodemailer  = require("nodemailer"),
      sgTransport = require('nodemailer-sendgrid-transport'),
      options = {
          auth: {
            api_user: 'tommyg13',
            api_key: process.env.PASS
            }};

module.exports = {
    mailerSend: function(user,host,subject,text) {
var mailer = nodemailer.createTransport(sgTransport(options));
      var email = {
        to: user.email,
        from: '"Voting App" <info@votingapp.com>',
        subject,
        text
      };
     mailer.sendMail(email);
},

};