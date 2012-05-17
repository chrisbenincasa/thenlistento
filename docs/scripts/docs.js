$(document).ready(function(){
  if(window.location.hash)
  {
    loadContent(window.location.hash)
  }

  $(".docs_link").click(function(e){
    var hash = this.hash
    $(".help_page_content").animate({height: 0}, 400, function(){
      $(".help_page_content").html("")
      loadContent(hash)
    })
  });
  
  function loadContent(fragment)
  {
    fragment = fragment.slice(1).replace(/!\//g, "");
    $(".help_page_content").load("./"+fragment+".html", function(){
      var height = $("#ajax_page_wrap").outerHeight();
      $(".help_page_content").animate({height: height}, 400)
    });
  }
  
  $(".country_header").click(function(e){
    $(this).siblings("div").slideToggle(250);
  });
  
  $(".country_list li div ul li").click(function(e){
    var query = this.innerHTML.replace(/\s/g, "+")
    window.location = "http://www.thenlistento.com/#!/hot/"+query
  });
  
});
