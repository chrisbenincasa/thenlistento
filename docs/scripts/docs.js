$(document).ready(function(){
  if(window.location.hash)
  {
    loadContent(window.location.hash)
  }

  $(".docs_link").click(function(e){
    $(".help_content").html("")
    var fragment = this.hash
    loadContent(fragment)
    //$(".help_content").load("./"+$(this).attr("rel")+".html")
  });
  
  function loadContent(fragment)
  {
    fragment = fragment.slice(1).replace(/!\//g, "");
    $(".help_page_content").load("./"+fragment+".html", function(){
      $(".help_page_content").animate({height: $("#ajax_page_wrap").height()}, 500);
    });
  }
});