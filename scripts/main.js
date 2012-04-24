$(document).ready(function(){
  $("#advanced_search").click(function(){
    $("#adv_search_opts").slideToggle(400, "easeOutCubic")
  })
  
  $("#about_link").click(function(e){
    //$("#black_overlay").fadeIn();
    if($("#help").is(":visible"))
    {
      $("#help").slideUp(400, "easeOutCubic", function(){
        $("#about").slideToggle(400, "easeOutCubic")
      })
    } else{
      $("#about").slideToggle(400, "easeOutCubic")
    }
  });
  
  $("#help_link").click(function(e){
    if($("#about").is(":visible"))
    {
      $("#about").slideUp(400, "easeOutCubic", function(){
        $("#help").slideToggle(400, "easeOutCubic")
      })
    } else{
      $("#help").slideToggle(400, "easeOutCubic")
    }
  });
  
  function validateForm()
  {
    
  }
  
  function newSearch(node, sys)
  {
    $.ajax({
      url: 'parser_class.py',
      type: 'POST',
      data: {artist: node.data.name, limit: 10},
      success: function(result)
      {
        var json = jQuery.parseJSON(result)
        
        for(var i = 0; i<json.nodes.length; i++)
        {
            sys.addNode(json.nodes[i].name, {name:json.nodes[i].name, weight: json.nodes[i].rating, url: json.nodes[i].url})
          if(i>0)
          {
            sys.addEdge(node.name, json.nodes[i].name)
          }
        }
      },
      error: function(request, status, error)
      {
        console.log("oops")
      }
    })
  }
  
  /*Declare ParticleSystem so it's scope is retained after AJAX*/
  var sys;
  
  function trackSearchFunc(inputLimit){
    var info = $("input#name").val().split(" by ")
    for(var i = 0; i<info.length; i++)
    {
      info[i] = toTitleCase(info[i])
    }
    var api = getApiKey()
    var track = info[0].replace(" ", "+")
    var artist = info[1].replace(" ", "+")
    var getUrl = getRequestUrl("track.getsimilar") + "&artist="+artist+"&track="+track+"&api_key="+api+"&limit="+inputLimit+"&format=json"
    
    $.ajax({
      type: "GET",
      url: getUrl,
      success: function(result){
        var similar = result.similartracks.track
        
        var Renderer = function(canvas){
        var canvas = $(canvas).get(0)
        var ctx = canvas.getContext("2d");
        var particleSystem

        var that = {
          init:function(system){
            particleSystem = system
            particleSystem.screenSize(canvas.width, canvas.height) 
            particleSystem.screenPadding(80)
            that.initMouseHandling()
          },

          redraw:function(){
            ctx.fillStyle = "white"
            ctx.fillRect(0,0, canvas.width, canvas.height)

            particleSystem.eachEdge(function(edge, pt1, pt2){
              ctx.strokeStyle = "rgba(0,0,0, .333)"
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(pt1.x, pt1.y)
              ctx.lineTo(pt2.x, pt2.y)
              ctx.stroke()
            })

            particleSystem.eachNode(function(node, pt)
            {
              ctx.fillStyle = "#2E4F4F"
              ctx.beginPath()
              ctx.arc(pt.x, pt.y, Math.sqrt(10*node.data.weight), 0, Math.PI*2, true)
              ctx.closePath()
              ctx.fill()
              ctx.fillStyle = "#000"
              ctx.font = "14pt Calibri"
              ctx.fillText(node.data.name, pt.x - Math.sqrt(node.data.name.length * 10), pt.y + (node.data.weight)/4.0 + 25)
              ctx.fillText(node.data.artist, pt.x - Math.sqrt(node.data.artist.length * 10), pt.y - (node.data.weight)/4.0 - 10)
            })    			
          },

          initMouseHandling:function(){
            var dragged = null;
            var handler = {  
              dblclick:function(e)
              {
                var pos = $(canvas).offset();
                _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
                dblclicked = particleSystem.nearest(_mouseP);
                
                window.open("http://"+dblclicked.node.data.url, "_newtab");
              },
              
              hover:function(e){
                var pos = $(canvas).offset()
                _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
                hovered = particleSystem.nearest(_mouseP);
                
                console.log(hovered)
              },
                          
              clicked:function(e){
                var pos = $(canvas).offset();
                _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
                dragged = particleSystem.nearest(_mouseP);
                                    
                if (dragged && dragged.node !== null){
                  // while we're dragging, don't let physics move the node
                  dragged.node.fixed = true
                }
                                    
                timeoutId = setTimeout(handler.search, 1000)
            
                $(canvas).bind('mousemove', handler.dragged)
                $(window).bind('mouseup', handler.dropped)

                return false
              },
          
              search:function(e){
                if(dragged.node && dragged.node.fixed == true)
                {  
                  newSearch(dragged.node, particleSystem)
                }
              },
          
              dragged:function(e){
                var pos = $(canvas).offset();
                var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

                if (dragged && dragged.node !== null){
                  var p = particleSystem.fromScreen(s)
                  dragged.node.p = p
                }

                return false
              },

              dropped:function(e){
                clearTimeout(timeoutId)
                if (dragged===null || dragged.node === undefined) return
                if (dragged.node !== null) dragged.node.fixed = false
                dragged.node.tempMass = 1000
                dragged = null
                $(canvas).unbind('mousemove', handler.dragged)
                $(window).unbind('mouseup', handler.dropped)
                _mouseP = null
                return false
              }
            }

            $(canvas).mousedown(handler.clicked);
            $(canvas).dblclick(handler.dblclick);
          }

        }
        return that
      }  
        
        if(typeof sys === "object"){
          sys.eachNode(function(node, pt){
            sys.pruneNode(node)
          })
        } else {
          sys = arbor.ParticleSystem(1000, 600, 0.5)
          sys.parameters({gravity:true, precision: 0.9, dt: 0.015})
          sys.renderer = Renderer("#viewport")
        }
  
        var canvas = $("#viewport").get(0)
        var ctx = canvas.getContext("2d");
        
        var base = sys.addNode(info[0], {name:info[0],artist:info[1],weight: 100, url:"http://www.google.com"})
        
        for(var i = 0; i<similar.length; i++)
        {
          theWeight = parseFloat(similar[i].match) * 100
          sys.addNode(similar[i].name, {name:similar[i].name, 
                                          artist: similar[i].artist.name,
                                          weight: theWeight,
                                          url: similar.url})
          sys.addEdge(base, similar[i].name)
        }
                    
        $("#container").fadeIn(1000, "easeInQuad")
      },
      
      error: function(xhr, status, code){
        console.log(status)
      }
    })
    
  }
  
    $("input").keypress(function(e){
      if(e.which == 13)
      {        
        e.preventDefault() 
        $("container").fadeOut(100)
                
        //validate form
        var intRegex = /^\d+$/;
        var inputLimit = $("input#limit").val()
        if(inputLimit.length > 0 && intRegex.test(inputLimit) == false)
        {
          //that's not a number!
          return
        }
        else if (inputLimit > 20)
        {
          //too big
          return
        } 
        else if (inputLimit == 0 || inputLimit.length == 0) {
          //limit defaults to 10 if nothing is entered
          inputLimit = 10;
        }
        
        //hide advanced search options if visible upon search
        if($("#adv_search_opts").is(":visible"))
        {
          $("#adv_search_opts").slideToggle()
        }
        
        var searchQuery = $("input#name").val();
        
        var trackSearch = /(([A-z0-9]+)\s*)+by\s([A-z0-9]+\s*)+/
        var genreSearch = /genre:\s*[A-z0-9]+(\s[A-z0-9&]*)*/
        if(trackSearch.test(searchQuery) == true)
        {
          console.log("track search")
          trackSearchFunc(inputLimit);
          return
        } 
        else if(genreSearch.test(searchQuery))
        {
          console.log("genre search")
          genreSearchFunc(inputLimit);
          return
        }
                
        $.ajax({
    			url: 'parser_class.py',
    			type: 'POST',
    			data: {artist: $("input#name").val(), limit: inputLimit},
    			success: function(result)
    			{
            var Renderer = function(canvas){
            var canvas = $(canvas).get(0)
            var ctx = canvas.getContext("2d");
            var particleSystem

            var that = {
              init:function(system){
                particleSystem = system
                particleSystem.screenSize(canvas.width, canvas.height) 
                particleSystem.screenPadding(80)
                that.initMouseHandling()
              },

              redraw:function(){
                ctx.fillStyle = "white"
                ctx.fillRect(0,0, canvas.width, canvas.height)

                particleSystem.eachEdge(function(edge, pt1, pt2){
                  ctx.strokeStyle = "rgba(0,0,0, .333)"
                  ctx.lineWidth = 1
                  ctx.beginPath()
                  ctx.moveTo(pt1.x, pt1.y)
                  ctx.lineTo(pt2.x, pt2.y)
                  ctx.stroke()
                })

                particleSystem.eachNode(function(node, pt)
                {
                  var w = 10
                  ctx.fillStyle = "#2E4F4F"
                  ctx.beginPath()
                  ctx.arc(pt.x, pt.y, Math.sqrt(10*node.data.weight), 0, Math.PI*2, true)
                  ctx.closePath()
                  ctx.fill()
                  ctx.fillStyle = "#000"
                  ctx.font = "14pt Calibri"
                  ctx.fillText(node.data.name, pt.x - (node.data.name.length * 4.12), pt.y + Math.sqrt(10*node.data.weight) + 20)
                })    			
              },

              initMouseHandling:function(){
                var dragged = null;
                var handler = {  
                  dblclick:function(e)
                  {
                    var pos = $(canvas).offset();
                    _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
                    dblclicked = particleSystem.nearest(_mouseP);
                    
                    window.open("http://"+dblclicked.node.data.url, "_newtab");
                  },
                              
                  clicked:function(e){
                    var pos = $(canvas).offset();
                    _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
                    dragged = particleSystem.nearest(_mouseP);
                                        
                    if (dragged && dragged.node !== null){
                      // while we're dragging, don't let physics move the node
                      dragged.node.fixed = true
                    }
                                        
                    timeoutId = setTimeout(handler.search, 1000)
                
                    $(canvas).bind('mousemove', handler.dragged)
                    $(window).bind('mouseup', handler.dropped)

                    return false
                  },
              
                  search:function(e){
                    if(dragged.node && dragged.node.fixed == true)
                    {  
                      newSearch(dragged.node, particleSystem)
                    }
                  },
              
                  dragged:function(e){
                    var pos = $(canvas).offset();
                    var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

                    if (dragged && dragged.node !== null){
                      var p = particleSystem.fromScreen(s)
                      dragged.node.p = p
                    }

                    return false
                  },

                  dropped:function(e){
                    clearTimeout(timeoutId)
                    if (dragged===null || dragged.node === undefined) return
                    if (dragged.node !== null) dragged.node.fixed = false
                    dragged.node.tempMass = 1000
                    dragged = null
                    $(canvas).unbind('mousemove', handler.dragged)
                    $(window).unbind('mouseup', handler.dropped)
                    _mouseP = null
                    return false
                  }
                }

                $(canvas).mousedown(handler.clicked);
                $(canvas).dblclick(handler.dblclick);
              }

            }
            return that
          }  
            
            if(typeof sys === "object"){
              sys.eachNode(function(node, pt){
                sys.pruneNode(node)
              })
            } else {
              sys = arbor.ParticleSystem(1000, 600, 0.5)
              sys.parameters({gravity:true, precision: 0.9, dt: 0.015})
              sys.renderer = Renderer("#viewport")
            }
    
            var json = jQuery.parseJSON(result)      
            var canvas = $("#viewport").get(0)
            var ctx = canvas.getContext("2d");
        
            for(var i = 0; i<json.nodes.length; i++)
            {
              sys.addNode(json.nodes[i].name, {name:json.nodes[i].name, weight: json.nodes[i].rating, url: json.nodes[i].url})  
              if(i>0)
              {
                sys.addEdge(json.nodes[0].name, json.nodes[i].name)
              }
            }
      
            var index = 0
            sys.eachNode(function(node,pt){
              console.log(json.nodes[index])
              index++
            });
                      
            $("#container").fadeIn(1000, "easeInQuad")
                      
    	    },

    			error: function(xhr, ajaxOptions, thrownError)
    			{
    			  console.log(thrownError)
    		  }
    		  
        });
        
        return false;
      }
    })
    
    function genreSearchFunc(inputLimit)
    {
      var genre = $("input#name").val().split(":")
      var genre = genre[1].replace(" ", "")
      var api = getApiKey()
      
      console.log(api)
      
      $.ajax({
        url: getRequestUrl("tag.gettopartist") + "&tag="+genre+"&api_key="+api+"&limit="+inputLimit+"&format=json",
        type: "GET",
        success: function(response)
        {
          console.log(response)
        }
      })
    }
});