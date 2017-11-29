$(document).ready(function(){
   // add new fields
   $("#add").on("click",function(){
       $("<label>Options:</label> <br><input name='options' class='form-control option'></input>").insertBefore("#submit");
   }); 
   
   // handle add new poll form
   $("#newPoll").on("submit",function(e){
      e.preventDefault();
      $(".errorCont").html("");
    let errors=[];
    if($(".title").val().trim() === "") {
        errors.push({msg: "Title is required"});
    }
    if($(".option").val().trim() === "") {
        errors.push({msg: "Options are required"});
    }

        const formData=$(this).serialize();
      $.ajax({
         type: "POST",
         url: "/new_poll",
         data: formData
      }).done(response=>window.location.href = `/show/${response.id}`)
        .fail(err=>{
            // handle the case that session expired
            if(!err.responseJSON) {
            renderErrors([{msg:"You have to login to create new poll"}]);
            } else {
            renderErrors(err.responseJSON.msg);
            }
        });
   
       
   });
   
   //handle error responses
   function renderErrors(errors) {
       let resultcontent = "";
        errors.map(error=>{
            resultcontent+=`<div class="container errorCont"><div class="alert alert-danger"><p>${error.msg}</p></div></div>`;
        });
            $("#newPoll").prepend(resultcontent);
   }
});
function add_fields() {
  var d = document.getElementById("content");
  
  d.innerHTML += "<br /><span><input id=input type='text'style='width:80px;'value='' /></span>";
  $("#add, .btn-success, .btn-danger").hide();
    $("#confirm").show();
     $("#confirm").css('margin-left', '0px');
}
 $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
  
function submitOption() {
     let text=document.getElementById("input").value;
     var x = document.getElementById("mySelect");
    var option = document.createElement("option");
    if(text !== "") 
    {
    option.text = text;
    x.add(option);
    $("#confirm, #input").hide();
     $(".btn-success, .btn-danger").show();        
    }
}

function NewOption() {
  var d = document.getElementById("new");
  
  d.innerHTML += "<label>Options:</label><br /><input name=options class=form-control> </input>";
}
