const express = require("express");
const router = express.Router();

function requireLogin (req, res, next) {
  if (req.session.user===undefined) {
    
     res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
     req.session.destroy();
    res.redirect('/login');
  } else {
    next();
  }
};
router.get("/new_poll",requireLogin,(req,res)=>{
   res.render("poll"); 
});

module.exports = router;