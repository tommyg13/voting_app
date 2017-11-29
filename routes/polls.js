const express = require("express");
const poll = require("../models/polls");
const router = express.Router();

/* Authenticate user */
function requireLogin (req, res, next) {
    
  if (req.session.user===undefined  && req.user===undefined) {
    
     res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
     req.session.destroy();
    res.redirect('/login');
  } else {
    next();
  }
}

/* render new poll page */
router.get("/new_poll",requireLogin,(req,res)=>{
   res.render("poll",{csrfToken: req.csrfToken()}); 
});

/* handle new poll */
router.post("/new_poll",(req,res)=>{
    let {title,options} = req.body;
    let author= req.user.email;
    // remove duplicates
    let newOptions= new Set(options);
    let errors=[{msg:""}];
console.log(options)
    if(!title || !options) {
        errors[0].msg="All fields are required";
    }
    else {
        if(newOptions.size !== options.length) {    
        errors[0].msg = "Options must be different";                            
        }    
    }
    // send error messages 
    if(errors[0].msg !== "") {
    res.status(400).json({msg:errors});        
    }
    // proceed to the creation of new poll
    else {
        // add votes to options
    let choice=options.map(option=>{
            return {
                option,
                votes:0
            };
        });
    // create use choice object        
    let userChoices = {
      title,
      author,
      choices: [{
        choice
      }]
    };        
    let newPoll = new poll();
        // create new poll
        newPoll.createPoll(userChoices);
        newPoll.save((err,poll)=>{
            if(err) res.status(500).json({msg:"Error saving on db"});
            else res.send({id:poll._id});
            });
    }
});

/* render one poll */
router.get("/show/:id",(req,res)=>{
   let id= req.params.id;
   let auth= false;
   let option=[];
   let votes=[];

  poll.findById(id,(err,doc)=>{
      if(doc===null || doc === undefined){
          req.flash("error","Poll not found");
          res.redirect("/");
      }
      else {
          if(req.user && doc.author == req.user.email) {
             
              auth= true;
          }
        for(let i=0; i< doc.options.length; i++){
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
        let options = function(option) {
            this.option = choice;
            this.votes = 0;
        };
        let New = new options(choice);
        poll.update({_id: id, 'options.option': {$ne: New.option}}, 
            {$push: {options: {'option': New.option, 'votes': New.votes}}},(err)=>{
                if(err)console.log(err);
       });
        poll.update({_id: id, "options.option": New.option},
                  {$inc: {"options.$.votes": 1}},
                  (err, vote)=> {
                    if (err) {
                      console.log( err);
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