const express = require("express");
const router = express.Router();
const poll = require("../models/polls");

/* Get home page */
router.get("/",(req,res)=>{
  poll.find()
          .then((doc)=>{
				res.render("index",{title:doc});
});
});

/**
 Ensure a user is logged in before allowing them to continue their request.
 If a user isn't logged in, they'll be redirected back to the login page.
 */
function requireLogin (req, res, next) {
  if (req.session.user===undefined) {

    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
     req.session.destroy();
    res.redirect('/login');
  } else {
    
    next();
  }
};

/*Render the profile page. */
router.get('/profile', requireLogin, function(req, res) {
    poll.find()
          .then((doc)=>{
				res.render('Profile',{title:doc});
});
});



module.exports = router;