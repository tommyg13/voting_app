
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
    option.text = text;
    x.add(option);
    $("#confirm, #input").hide();
     $(".btn-success, .btn-danger").show();
}

function NewOption() {
   var d = document.getElementById("new");
  
   d.innerHTML += "<label>Options:</label><br /><input name=options class=form-control> </input>";
}
