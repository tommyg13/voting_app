function add_fields() {
   var d = document.getElementById("content");
  
   d.innerHTML += "<br /><span><input id=input type='text'style='width:68px;'value='' /></span>";
   $("#add, .btn-success, .btn-danger").hide();
    $("#confirm").show();
}
 $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
  
function submitOption() {
     let text=document.getElementById("input").value;
     console.log(text)
     var x = document.getElementById("mySelect");
    var option = document.createElement("option");
    option.text = text;
    x.add(option);
    $("#confirm, #input").hide();
     $(".btn-success, .btn-danger").show();
}