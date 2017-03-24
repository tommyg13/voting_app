const express = require("express");
const router = express.Router();

/* Get home page */
router.get("/",(req,res)=>{
   res.render("index");
});

/* Get register page */
router.get("/register",(req,res)=>{
   res.render("register"); 
});

/* Get login page */
router.get("/login",(req,res)=>{
   res.render("login");
});

/* Get forgot password page */
router.get("/forgot",(req,res)=>{
   res.render("forgot");
});

/* Handle forgot password */
router.post("/forgot",(req,res)=>{
   res.redirect("/register");
});

module.exports = router;