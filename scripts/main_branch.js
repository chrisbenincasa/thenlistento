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
  
  function newSearch(node, sys, mode)
  {
    if (mode == "artist")
    {
      var artistName = node.data.name.replace(" ", "+")
      var newRequestURL = getRequestUrl("artist.getsimilar")+"&format=json&limit=10&artist="+artistName+"&api_key="+getApiKey()
    } else {
      var artistName = node.data.artist.replace(" ", "+")
      var trackName = node.data.name.replace(" ", "+")
      var newRequestURL = getRequestUrl("track.getsimilar")+"&format=json&limit=10&artist="+artistName+"&track="+trackName+"&api_key="+getApiKey()
    }
    
    $.ajax({
      url: newRequestURL,
      type: 'GET',
      success: function(result)
      {
        if (mode == "artist")
        {
          nodes = result.similarartists.artist
        } else {
          nodes = result.similartracks.track
        }
        
        for(var i = 0; i < nodes.length; i++)
        {
          var newWeight = nodes[i].match * 100
          sys.addNode(nodes[i].name, {name:nodes[i].name, weight: newWeight, url: nodes[i].url})
          
          if(typeof nodes[i].artist != "undefined")
          {
            sys.getNode(nodes[i].name).data.artist = nodes[i].artist.name
          }
          
          if(i>0)
          {
            sys.addEdge(node.name, nodes[i].name)
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
        var similarTracks = result.similartracks.track
        var searchedArray = result["similartracks"]["@attr"]
        var url = "http://last.fm/music/"+searchedArray["artist"].replace(" ", "+")+"/_/"+searchedArray["track"].replace(" ", "+")
        similarTracks.unshift({"name":searchedArray["track"], "artist":{"name": searchedArray["artist"]}, "match": 1, "url" : url})
        initializeGraph(result, similarTracks, "track")
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
      
      var artistVal = $("input#name").val().replace(" ", "+")
      var api = getApiKey()
      var requestURL = getRequestUrl("artist.getsimilar") + "&format=json&artist="+artistVal+"&limit="+inputLimit+"&api_key="+api
          
      $.ajax({
        url: requestURL,
  			//url: 'parser_class.py',
  			type: 'GET',
  			//data: {artist: $("input#name").val(), limit: inputLimit},
  			success: function(result)
  			{
  			  var artistArray = result.similarartists.artist
  			  var searchedArtist = result["similarartists"]["@attr"]["artist"]
  			  artistArray.unshift({"name": searchedArtist, "url": "http://www.last.fm/music/"+searchedArtist.replace(" ", "+"), "match": 1})
          initializeGraph(result, artistArray, "artist");                    
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
    
  function initializeGraph(result, nodes, mode)
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
          if (typeof node.data.artist == "string")
          {
            ctx.fillText(node.data.artist, pt.x - (node.data.artist.length * 4.12), pt.y + Math.sqrt(10*node.data.weight) + 40)
          }
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
            
            window.open(dblclicked.node.data.url, "_newtab");
          },
                      
          clicked:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
            dragged = particleSystem.nearest(_mouseP);
                                
            if (dragged && dragged.node !== null){
              // while we're dragging, don't let physics move the node
              dragged.node.fixed = true
            }
            if (mode == "artist")
            {                    
              timeoutId = setTimeout(handler.searchArtist, 1000)
            } else {
              timeoutId = setTimeout(handler.searchTrack, 1000)
            }
            
            $(canvas).bind('mousemove', handler.dragged)
            $(window).bind('mouseup', handler.dropped)

            return false
          },
      
          searchArtist:function(e){
            if(dragged.node && dragged.node.fixed == true)
            {  
              newSearch(dragged.node, particleSystem, "artist")
            }
          },
          
          searchTrack:function(e)
          {
            if(dragged.node && dragged.node.fixed == true)
            {
              newSearch(dragged.node, particleSystem, "track")
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

      if (typeof sys === "object"){
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
    
      for(var i = 0; i<nodes.length; i++)
      {
        var newWeight = (nodes[i].match*100)
        var urlPattern = /http:\/\//
        if(!urlPattern.test(nodes[i].url))
        {
          nodes[i].url = "http://"+nodes[i].url
        }
        
        sys.addNode(nodes[i].name, {name:nodes[i].name, weight:newWeight, url:nodes[i].url})
        if(typeof nodes[i].artist != "undefined")
        {
          sys.getNode(nodes[i].name).data.artist = nodes[i].artist.name
        }
        if(i>0)
        {
          sys.addEdge(nodes[0].name, nodes[i].name)
        }
      }

      $("#container").fadeIn(1000, "easeInQuad")
    }
  
  /*$("#viewport").mousewheel(function(e,d){
    var context = this.getContext("2d");
    var scale = 1;
    var originX = 0;
    var originY = 0;
    
    var mouseX = e.clientX - this.offsetLeft;
    var mouseY = e.clientY - this.offsetTop;
    
    var zoom = d+1
    
    console.log(zoom)
    
    context.translate(originX, originY)
    context.scale(zoom, zoom)
    
    //context.translate(this.width / 2, this.height /2);
    
  }) */
   
});