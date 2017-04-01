const express = require("express");
const poll = require("../models/polls");
const router = express.Router();

/* Authenticate user */
function requireLogin (req, res, next) {
  if (req.session.user===undefined) {
    
     res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
     req.session.destroy();
    res.redirect('/login');
  } else {
    next();
  }
};

/* render new poll page */
router.get("/new_poll",requireLogin,(req,res)=>{
   res.render("poll",{csrfToken: req.csrfToken()}); 
});

/* handle new poll */
router.post("/new_poll",(req,res)=>{
let username = req.user.username;
let option=req.body.options;
console.log(option)
      let choices = function(option) {
        this.option = option;
        this.votes = 0;
      },
      choices1 = [];
      option.forEach(function(item) {
    var x = new choices(item);
    choices1.push(x);
  });

let data = new poll({
    title:  req.body.title,
    options:choices1,
    author: username
  });

 poll.createPoll(data, function(err, poll) {
    if (err) throw err;

    res.redirect('/show/' + poll._id);
});
});

/* render one poll */
router.get("/show/:id",(req,res)=>{
   let id= req.params.id;
   let auth= false;
   let option=[];
   let votes=[];
  poll.findById(id,(err,doc)=>{
      if(err) console.log(err);
      else {
          if(req.user === undefined ){
            auth = false;
          }
          else if(doc.author == req.user.username) {
              auth= true;
          }

        for(let i=0; i<doc.options.length; i++){
            option.push(doc.options[i].option);
            votes.push(doc.options[i].votes);

        }
          res.render("show",{title:doc.title, options:option, auth, id,votes,csrfToken: req.csrfToken()});
}
  });
 
});

/* Submit poll */
router.post("/show/:id",(req,res)=>{
        let id=req.params.id;
        let choice= req.body.option;
        let newChoice = function(option) {
            this.option = choice;
            this.votes = 0;
        };
        let New = new newChoice(choice);
        
    poll.update({_id: id}, {$addToSet: {"options": New, $exists: false}}, function(err, doc){
          if (err) {
            console.log(err);
          } 
          else {
              console.log(doc)
          }
});
    poll.update({_id: id, "options.option": choice},
              {$inc: {"options.$.votes": 1}},
              function(err, vote) {
                if (err) {
                  console.log( err);
                } else {
                  console.log( vote);
                }
              });


            res.redirect("/show/"+id);
});

/* Delete poll */
router.get("/delete/:id",(req,res)=>{
   let id= req.params.id;
poll.findByIdAndRemove(id).exec();
res.redirect("/");
});

module.exports = router;