$(document).ready(function(){
  var svg = d3.select(".canvas_container").append("svg:svg")
        .attr("class", "graph")
        .attr("width", 960)
        .attr("height", 720);
  var searchInput = $("input#name");
  var searchCount = 0,
      force,
      node,
      link,
      data = {},
      leafFoci = [
        {x: 50, y: 50}, 
        {x: 250, y: 50},
        {x: 450, y: 50},
        {x: 650, y: 50},
        {x: 850, y: 50},
        {x: 50, y: 172},
        {x: 50, y: 284},
        {x: 50, y: 396},
        {x: 850, y: 162},
        {x: 850, y: 274},
        {x: 850, y: 386},
        {x: 50, y: 500}, 
        {x: 250, y: 500},
        {x: 450, y: 500},
        {x: 650, y: 500},
        {x: 850, y: 500},
      ],
      rootFoci = [
        {x: 250, y: 162},
        {x: 383, y: 162},
        {x: 516, y: 162},
        {x: 649, y: 162},
        {x: 250, y: 325},
        {x: 649, y: 325},
        {x: 250, y: 488},
        {x: 383, y: 488},
        {x: 516, y: 488},
        {x: 649, y: 488}
      ],
      leafIter = 0,
      rootIter = 0,
      strengthScale = d3.scale.sqrt().range([0,0.133]),
      distanceScale = d3.scale.sqrt().domain([0,100]).range([20,80]),
      placeholders = {
        "discover":["The Beatles", "genre: rock", "Creep by Radiohead"],
        "hot":["what's hot", "what's popular in New York"],
        "history":["influenced Led Zeppelin", "did Nirvana influence"]
      },
      currentPlaceholderSet = "discover"
      pIndex = 0;
  //Hash search
  if(window.location.hash.length)
  {
    var hash = window.location.hash;
    hash = hash.split("/");
    var hashSearchType = hash[1]
    if(hashSearchType === "discover")
    {
      $("input#name").val(toTitleCase(hash[2].replace(/[+]/g, " ")));
      search();
    }
    else if(hashSearchType === "hot")
    {
      if(typeof hash[2] !== "undefined" && hash[2].length > 0)
      {
        switchSearch(null, "hot")
        var hashLocation = /\b(in|around|near)\s(the)*\s*(([A-z]+\s*)*)/
        $("input#hot_name").val("What's Hot near "+toTitleCase(hash[2].replace(/[+]/g, " ")));
        var hashExtract = $("input#hot_name").val().match(hashLocation)
        locationSearch($("input#hot_name").val(), hashExtract)
      } else {
        switchSearch(null, "hot");
        $("input#hot_name").val("What's Hot");
        hotSearch($("input#hot_name").val())
      }
    }
    else if(hashSearchType === "history")
    {
      switchSearch(null, "history")
      var historyType = hash[2].split("?")
      if(typeof historyType[1] === "undefined" || historyType[1].split("=")[1] === "1")
      {
        $("input#history_name").val("influenced " + toTitleCase(historyType[0].replace(/[+]/g, " ")))
        getBeginYear(historyType[0], 1)
      } else
      {
        $("input#history_name").val("did "+toTitleCase(historyType[0].replace(/[+]/g, " "))+" influence")
        getBeginYear(historyType[0], 2)
      }
    } else {
      showError("A redirect error occured");
      console.log("A redirect error occured.");
    }
  }
  
  //Handlers
  $("#advanced_search").click(function(){
    e.preventDefault();
    $("#adv_search_opts").slideToggle(400, "easeOutCubic");
  });
  
  $(".about_link").click(function(e){
    e.preventDefault();
    if($("#help").is(":visible"))
    {
      $("#help").slideUp(400, "easeOutCubic", function(){
        $("#about").slideToggle(400, "easeOutCubic");
      });
    } else{
      $("#about").slideToggle(400, "easeOutCubic");
    }
  });
  
  $(".help_link").click(function(e){
    e.preventDefault();
    if($("#about").is(":visible"))
    {
      $("#about").slideUp(400, "easeOutCubic", function(){
        $("#help").slideToggle(400, "easeOutCubic");
      });
    } else{
      $("#help").slideToggle(400, "easeOutCubic");
    }
  });
  
  $("#active_force_checkbox").click(function(e){
    if($(this).is(":checked"))
    {
      $("#force_search_select").removeAttr("disabled");
    } else {
      $("#force_search_select").attr("disabled", true);
    }
  });
  
  $("#links_right a").click(function(e){
    e.preventDefault();
    switchSearch($(e.currentTarget));
  });

  function switchSearch(el, override)
  {
    var clicked = (typeof override == "undefined") ? el.attr("rel") : override,
        visible = $("form:visible")
    if($("form#"+clicked).is(":visible"))
    {
      return;
    } else {
      visible.fadeOut("fast", function(e){
        $("form#"+clicked).fadeIn("fast");
        searchInput = $("form#"+clicked).find("input");
        currentPlaceholderSet = clicked;
        pIndex = 0;
      })
    }
  }
  
  $(".help_tabs li a").click(function(e){
    e.preventDefault();
    var tabs = ["artists_help_link", "tracks_help_link", "genres_help_link"];
    var link = $(this);
    if(link.parent().hasClass("active"))
    {
      return;
    } else {
      link.parent().siblings(".active").removeClass("active");
      link.parent().addClass("active");
      $(".help_content").children(".active").hide(0, function(){
        $(this).removeClass("active");
        $("."+link.attr("rel")+"_content").show(0, function(){
          $(this).addClass("active");
        });
      });
    }  
  });
  
  $(".help_content a.example").click(function(e){
    e.preventDefault();
    $("#help").slideToggle(400, "easeOutCubic");
    if($(this).attr("rel") === "discover")
    {
      switchSearch(null, "discover")
      $("input#name").val(stripTags($(this).html(), "strong"));
      search();
    }
    else if($(this).attr("rel") === "hot")
    {
      switchSearch(null, "hot");
      $("input#hot_name").val(stripTags($(this).html(), "strong"))
      hotSearch($("input#hot_name").val())
    }
    else if($(this).attr("rel") === "history")
    {
      switchSearch(null, "history");
      $("input#history_name").val(stripTags($(this).html(), "strong"));
      influenceSearchType();
    }
  });
  
  function changePlaceholder(placeholders, index)
  {
    if(!searchInput.is(":focus"))
    {
      searchInput.attr("placeholder", placeholders[pIndex]);
      pIndex++;
      if(pIndex === placeholders.length)
      {
        pIndex = 0;
      }
    }
  }
  
  var placeholderChange = setInterval(function(){changePlaceholder(placeholders[currentPlaceholderSet], pIndex)}, 3500)
  
  $("input").blur(function(){
    placeholderChange = setInterval(function(){changePlaceholder(currentPlaceholderSet[currentPlaceHolderSet], pIndex)}, 3500)
  });
  
  $("input").focus(function(){
    clearInterval(placeholderChange)
  })
  
  function resetGraph()
  {
    if(typeof force === "object")
    {
      node.data([]).exit().remove()
      link.data([]).exit().remove()
      names.data([]).exit().remove()
    }
      
    force = d3.layout.force()
      .charge(-3000)
      .linkDistance(function(d){
      //return 13*Math.sqrt((searchCount+1)*d.target.match)
        return distanceScale(d.target.match)
        })
      .linkStrength(function(d){
        return 0.18
        //return strengthScale((searchCount+1)*d.target.match)
        })
      .gravity(0.1)
      .size([960,700])
      .on("tick", tick);
  }
  
  $("#discover input").keypress(function(e){
    $(".search_error").hide();    
    if(e.which == 13)
    {
      searchCount = 0;
      e.preventDefault();
      search();
      return false;
    }
  })
  
  function search()
  {  
    //validate form
    if(!$("input#name").val())
    {
      this.focus();
      return;
    } 
    
    var intRegex = /^\d+$/;
    //var inputLimit = $("input#limit").val();
    var inputLimit = 10;
    if(inputLimit.length > 0 && intRegex.test(inputLimit) == false)
    {
      $(".limit_error").html("Enter a number!").show();
      $(this).focus();
      return
    } 
    else if (inputLimit > 20)
    {
      $(".limit_error").html("Enter a number less than 20!").show();
      $(this).focus();
      return
    } 
    else if (inputLimit == 0 || inputLimit.length == 0) {
      //limit defaults to 10 if nothing is entered
      inputLimit = 10;
    }
    var toSerialize = $("input#name").val()
    var serial = toSerialize.replace(/\s/g, "+")
    //var limitHash = $("input#limit").val()
    window.location.hash = "!/discover/"+serial
    
    //hide advanced search options if visible upon search
    if($("#adv_search_opts").is(":visible"))
    {
      $("#adv_search_opts").slideToggle();
    }
    
    //If limit search parameter is marked, then execute that search
    if($("#active_force_checkbox").is(":checked"))
    {
      var cases = {"artist":artistSearchFunc, "track": trackSearchFunc, "genre": genreSearchFunc};
      var force_val = $("#force_search_select").val();
      if(forces_val == "track")
      {
        cases[force_val](inputLimit, true);
      } else {
        cases[force_val](inputLimit);
      }
      
    } else {
      var searchQuery = $("input#name").val();

      switch(searchType(searchQuery))
      {
        case 0:
          trackSearchFunc(inputLimit, null);
          break;
        case 1:
          trackOnlySearchFunc(inputLimit, null);
          break;
        case 2:
          genreSearchFunc(inputLimit);
          break;
        case 3:
          artistSearchFunc(inputLimit);
          break;
        case 4:
          artistSearchFunc(inputLimit);
          break;
      } 
    }
    updateShareButtons();
  }
  
  function searchType(query)
  {
    var expressions = {"trackSearch" : /(([A-z0-9]+)\s*)+\bby\b\s([A-z0-9]+\s*)+/,
                       "trackOnlySearch": /\[*\b(track|song)\b\]*:\s*([A-z0-9]+\s*)+/i,
                       "genreSearch": /\[*\b(genre|mood|tag)\b\]*:\s*[A-z0-9]+(\s[A-z0-9&]*)*/i,
                       "artistSearch": /\[*\b(artist|band)\b\]*:\s*[A-z0-9]+(\s[A-z0-9&]*)*/i,
                       "whoHotBase": /(what[']*s)\s\b(hot|good|new|popular)\b/
                      }
                      
    var length = 4, index = 0
    for(var key in expressions)
    {
      if(expressions[key].test(query))
      {
        switch(key)
        {
          case "trackSearch":
            return 0
          case "trackOnlySearch":
            return 1
          case "genreSearch":
            return 2
          case "artistSearch":
            return 4
        }
      } 
      else if(index == length)
      {
        return 3
      }
      index++
    }
  }
  
  function artistSearchFunc(inputLimit)
  {
    searchCount = 0;
    var flags = $("input#name").val().split(":")
    if(flags.length > 1)
    {
      var artistVal = flags[1].replace(" ", "+")
    } else {
      var artistVal = flags[0].replace(" ", "+")
    }
    var api = getApiKey()

    var requestURL = getRequestUrl("artist.getsimilar") + "&format=json&artist="+artistVal+"&autocorrect=1&limit="+inputLimit+"&api_key="+api
        
    resetGraph();
    
    d3.json(requestURL, function(d){
      if(typeof d.error != "undefined" || typeof d.similarartists.artist != "object")
      {
        showError("The artist you searched could not be found.");
        $("input#name").focus();
      }
      var artists = d.similarartists.artist      
      updateData(artists, "artist", d.similarartists["@attr"].artist)
      initializeGraph(d, data, "artist")      
    });
  }
  
  function trackOnlySearchFunc(inputLimit, extraInfo)
  {
    var api = getApiKey(),
        info = $("input#name").val().split(":"),
        track = info[1].replace(/\s/g, "+")
        getUrl = getRequestUrl("track.search") + "&limit=1&format=json&track="+track+"&api_key="+api
    
    d3.json(getUrl, function(d){
      if(typeof d.error != "undefined")
      {
        showError("The song you searched couldn not be found.");
      } else {
        var returnedArtist = d.results.trackmatches.track.artist
        getUrl = getRequestUrl("track.getsimilar")+"&artist="+returnedArtist.replace(/\s/g,"+")+"&track="+track+"&limit="+inputLimit+"&format=json&api_key="+api
        d3.json(getUrl, function(e){
          if(typeof e.error != "undefined")
          {
            showError();
          }
          resetGraph();
          var similarTracks = e.similartracks.track,
              searchedArray = e.similartracks["@attr"];
          updateData(similarTracks, "track", searchedArray)
          initializeGraph(e, data, "track");
        })
      }
    })
  }
  
  function updateShareButtons()
  {
    var twitterUrl = "https://twitter.com/share?url=",
        link = encodeURIComponent(window.location.href),
        text = encodeURIComponent("Share"),
        facebookUrl = "http://www.facebook.com/sharer.php?u="
    $(".tweet_button").attr("href", twitterUrl + link + "&text=" + text)
    $(".facebook_button").attr("href", facebookUrl + link + "&t=" + text)
    $(".search_permalink").val(window.location.href)
  }
  
  function trackSearchFunc(inputLimit, extraInfo)
  {
    var api = getApiKey();
    searchCount = 0;
    if(extraInfo === null)
    {
      var info = $("input#name").val().split(" by ")
      for(var i = 0; i < info.length; i++)
      {
        info[i] = toTitleCase(info[i])
      }
      var track = info[0].replace(/\s/g, "+"),
          artist = info[1].replace(/\s/g, "+")
    } else {
      var track = extraInfo["track"],
          artist = extraInfo["artist"]
    }

    var getUrl = getRequestUrl("track.getsimilar") + "&artist="+artist+"&autocorrect=1&track="+track+"&api_key="+api+"&limit="+inputLimit+"&format=json"
  
    
    d3.json(getUrl, function(d){
      if(typeof d.error != "undefined")
      {
        showError();
      } else {
        resetGraph();
        var similarTracks = d.similartracks.track,
            searchedArray = d.similartracks["@attr"]
        updateData(similarTracks, "track", searchedArray)
        initializeGraph(d, data, "track")
      }
    })
  }
  
  function genreSearchFunc(inputLimit)
  {
    searchCount = 0;
    var genre = $("input#name").val().split(":");
    var genre = genre[1].replace(/\s/g, "")
    var api = getApiKey(),
        requestURL = getRequestUrl("tag.gettopartist")+"&tag="+genre+"&api_key="+api+"&limit="+inputLimit+"&format=json"
    
    d3.json(requestURL, function(d){
      if(typeof d.error != "undefined")
      {
        showError()
      } else {
        
        resetGraph()
        updateData(d.topartists.artist, "genre", genre)
        initializeGraph(d, data, "genre")
      }
    })
  }
  
  function updateData(infoArray, mode, extraInfo)
  {
    data["nodes"] = []
    data["links"] = []
    if(mode === "genre")
    {
      data["nodes"].push({
        "name"  : toTitleCase(extraInfo),
        "match" : 75,
        "url"   : "#",
        "id"    : "node_"+(Date.now()).toString(),
        "r"     : 1.33*Math.sqrt(75),
        "root"  : 1,
        "focus" : rootFoci[rootIter]
        })
    }
    else if (mode === "artist" || mode === "hot")
    {
      data["nodes"].push({
        "name"  : toTitleCase(extraInfo),
        "match" : 100,
        "id"    : "node_"+(Date.now()).toString(),
        "r"     : 1.33*Math.sqrt(100),
        "root"  : 1,
        "focus" : rootFoci[rootIter]
      })
    } else if (mode === "track")
    {
      data["nodes"].push({
        "name"  : toTitleCase(extraInfo["track"]),
        "artist": toTitleCase(extraInfo["artist"]),
        "match" : 100,
        "id"    : "node_"+(Date.now()).toString(),
        "r"     : 1.33*Math.sqrt(100),
        "root"  : 1,
        "focus" : rootFoci[rootIter]
      })
    }
      
    for(i in infoArray)
    { 
      var match = (mode != "genre") ? infoArray[i].match * 100 : 75
      if(mode === "hot")
      {
        var logScale = d3.scale.sqrt().range([1,3])
        match = logScale(infoArray[i].percentagechange)
      }
      data["nodes"].push({
        "name"  : infoArray[i].name,
        "match" : match,
        "url"   : infoArray[i].url,
        "id"    : "node_"+(Date.now()+i).toString(),
        "r"     : 1.33*Math.sqrt(match),
        "root"  : 0,
        "focus" : leafFoci[leafIter]
      })
      var currentLength = data["nodes"].length
      if(mode === "track")
      {
        data["nodes"][currentLength-1]["artist"] = infoArray[i].artist.name
      }
    }
    
    for(var i = 1; i < data["nodes"].length; i++)
    {
      data["links"].push({"source": 0, "target": i})
    }
    rootIter++;
    leafIter++;
  }
  
  function initializeGraph(result, data, mode)
  {    
    force.nodes(data["nodes"]).links(data["links"]).start();
    svg.append("g").attr("class", "links");
    svg.append("g").attr("class", "nodes");
    svg.append("g").attr("class", "names");
    
    link = svg.select("g.links").selectAll("line.link")
      .data(data["links"])
      .enter().append("line")
      .attr("class", function(d){return "link "+d.source.id+" "+d.target.id})
      .style("stroke", "#fff")
      .style("stroke-width", 0)
      
    node = svg.select("g.nodes").selectAll("circle.node")
      .data(data["nodes"])
      .enter().append("circle")
      .attr("class", function(d){return "node " + d.id})
      .attr("r", 0)
      .style("fill", function(i){return "#"+Math.floor(Math.random()*16777215).toString(16)})
      .call(force.drag)
    
    names = svg.select("g.names").selectAll("text.name")
      .data(data["nodes"])
      .enter().append("text")
      .attr("class", function(d){return "name "+d.id})
      .style("color", "black")
      .style("text-anchor", "middle")
      .style("font-size", "0px")
      .text(function(d){return d.name})
      .attr("x", function(d){return d.x})
      .attr("y", function(d){return d.y + (d.r + 17)})
    
    node.transition()
     .delay(1200)
     .duration(150)
     .attr("r", function(d){return d.r})
     
    link.transition()
     .delay(1200)
     .duration(150)
     .style("stroke-width", 1.1)
     .style("stroke", "#999")
    
    names.transition()
     .delay(3000)
     .duration(100)
     .style("font-size", "14px")
    
    fixTransitions()
  }
  
  $(document).on("click", "circle", function(n){
    n = n.target.__data__
    if(n.index > 0)
    {
      force.stop();
      var api = getApiKey();
      var requestURL = getRequestUrl("artist.getsimilar") + "&format=json&artist="+n.name+"&autocorrect=1&limit=10&api_key="+api
        d3.json(requestURL, function(d){
          addNodes(d, n)
        })
    }
  });
  
  $(document).on("mouseover", "circle", function(e){
      n = e.target.__data__;
      d3.select("circle."+n.id).classed("linked_node", true)
      link.each(function(d,i){
        if(d.target.index === n.index || d.source.index === n.index)
        {
          d3.select(this).classed("red", true).transition().style("stroke", "red")
          d3.select("circle."+d.source.id).classed("linked_node", true)
          d3.select("circle."+d.target.id).classed("linked_node", true)
          d3.select("text."+d.source.id).classed("linked_text", true)
          d3.select("text."+d.target.id).classed("linked_text", true)
        }
      })
      
      d3.selectAll("circle").filter(":not(.linked_node)").classed("fade", true).transition().style("opacity", "0.5")
      d3.selectAll("text").filter(":not(.linked_text)").classed("fade", true).transition().style("opacity", "0.5") 
  });
   
  $(document).on("mouseout", "circle", function(e){
   n = e.target.__data__;
   d3.selectAll(".linked_node").classed("linked_node", false);
   d3.selectAll(".linked_text").classed("linked_text", false);
   d3.selectAll(".fade").classed("fade", false).transition().style("opacity", "1.0");
   d3.selectAll("line.red").classed("red", false).transition().style("stroke", "#999");
  })
  
  $(document).on("dblclick", "circle", function(e){
    e.preventDefault();
    force.stop();
    n = e.currentTarget.__data__;
    var isHttp = /http[s]*:\/\//
    if (isHttp.test(n.url))
    {
      window.open(n.url, "_newtab")
    } else {
      window.open("http://"+n.url, "_newtab")
    }
  });
   
  function addNodes(d, n)
  {
    n.root = 1;
    n.focus = rootFoci[rootIter]
    ++searchCount;
    var artists = d.similarartists.artist,
        indexes = [];
    node.each(function(a){
      for(i in artists)
      {
        if(artists[i].name === a.name)
        {
          data["links"].push({
            "source": n.index,
            "target": a.index
          })
          indexes.push(i)
          artists.splice(i, 1)
        }
      }
    })

    for(i in artists)
    { 
      data["nodes"].push({
        "name"  : artists[i].name,
        "match" : artists[i].match*100,
        "url"   : artists[i].url,
        "id"    : "node_"+(Date.now() + i).toString(),
        "r"     : 1.33*Math.sqrt(artists[i].match*100),
        "root"  : 0,
        "focus" : leafFoci[leafIter]
      })            

      data["links"].push({
        "source": n.index,
        "target": data["nodes"].length - 1 
      })     
     } 
     
     force.nodes(data["nodes"]).links(data["links"]).start();
     
     link = link.data(data["links"])
          
     link.enter().append("line")
       .attr("class", function(d){return "link "+d.source.id+" "+d.target.id})
       .style("stroke-width", 1.1)
       .style("stroke", "#fff")
       .attr("x1", function(d){return d.source.x})
       .attr("y1", function(d){return d.source.y})
       .attr("x2", function(d){return d.target.x})
       .attr("y2", function(d){return d.target.y}).transition()
          .duration(65)
          .delay(function(d,i){return i*20})
          .attr("stroke-width", 1.1)
          .style("stroke", "#999")
     
     node = svg.select("g.nodes").selectAll("circle.node")
       .data(data["nodes"])

     //node.exit().remove()
     
     node.enter().append("circle")
     .attr("class", function(d){return "node "+d.id})
     .attr("r", 0)
     .style("fill", function(){return "#"+Math.floor(Math.random()*16777215).toString(16);})
     .call(force.drag)
       
     names = svg.select("g.names").selectAll("text.name")
        .data(data["nodes"])
          
     names.enter().append("text")
        .attr("class", function(d){return "name "+d.id})
        .style("font-size", "0px")
        .style("text-anchor", "middle")
        .attr("x", function(d){return d.x})
        .attr("y", function(d){return d.y + (d.r + 17)})
        .text(function(d){return d.name})

     force.nodes(data["nodes"]).links(data["links"])
       .start()
       .charge(-400);

     node.transition()
       .duration(150)
       .delay(function(d,i){return i*20})
       .attr("r", function(d){return d.r})
       
     names.transition()
        .duration(100)
        .delay(function(d,i){return i*20})
        .style("font-size", "14px");
    
    var k = Math.sqrt(node[0].length / (960*600))
    force.gravity(100 * k)
      .charge(function(d){ return strengthScale(d.match) * (-15/k)*Math.sqrt(searchCount)})
      .alpha(0.4)
      .friction(0.65)
    fixTransitions();
    rootIter++
    leafIter++
  }   

  
  function fixTransitions(){
    var clock = setInterval(function(e){
      if(force.alpha() < 0.0051)
      {
        d3.selectAll("circle").transition()
          .attr("r", function(d){return 1.33*Math.sqrt(d.match)})
          .style("opacity", "1.0");
        d3.selectAll("text").transition()
          .style("font-size", "14px")
          .style("opacity", "1.0")
        clearInterval(clock)
      }
    }, 500)
  }
    
  function tick(d,i)
  {
     /*var k = .2 * d.alpha;
         node.each(function(o, i) {
           o.y += (o.focus.y - o.y) * k;
           o.x += (o.focus.x - o.x) * k;
         });*/
    node.attr("cx", function(d) {
        var text = d3.select("text."+d.id)
        return d.x = Math.max(d.r, Math.min(960 - d.r, d.x)); 
        })
        .attr("cy", function(d) { return d.y = Math.max(d.r, Math.min(680 - d.r, d.y)); });
  
   link.attr("x1", function(d){return d.source.x})
      .attr("y1", function(d){return d.source.y})
      .attr("x2", function(d){return d.target.x})
      .attr("y2", function(d){return d.target.y})
  
    names.attr("x", function(d){return d.x})
         .attr("y", function(d){return d.y + (d.r + 17)});
    
  } 
  
  $("#hot input").keypress(function(e){
    $(".search_error").hide();
    if(e.which == 13)
    {
      searchCount = 0;
      e.preventDefault();
      var whoIsHot = /(what[']*s)\s\b(hot|good|new|popular|trending)\b/i,
          location = /\b(in|around|near)\s(the)*\s*(([A-z.,+]+\s*)*)/i,
          query = $("input#hot_name").val()

      if(whoIsHot.test(query))
      {
        if(location.test(query))
        {
          var extract = query.match(location)
          locationSearch(query, extract)
        } else {
          hotSearch(toTitleCase(query))
        }
      } else {
        alert("that's not right")
      }   
    }
  });
  
  function hotSearch(query)
  {
    var api = getApiKey(),
        searchUrl = getRequestUrl("chart.gethypedartists") + "&api_key="+api+"&limit=10&format=json"
    d3.json(searchUrl, function(d){
      resetGraph();
      var resultArray = d.artists.artist;
      updateData(resultArray, "hot", query)
      window.location.hash = "!/hot/"
      initializeGraph(d, data, "artist")
    })
  }
  
  function locationSearch(query, extract)
  {
    var isGeolocation = /\b(me|here)\b/i
    if(isGeolocation.test(query))
    {
      if(navigator.geolocation)
      {
        navigator.geolocation.getCurrentPosition(function(position){
          var lat = position.coords.latitude,
              lon = position.coords.longitude,
              geocoder = new google.maps.Geocoder(),
              latlong = new google.maps.LatLng(lat,lon);
          geocoder.geocode({"latLng":latlong}, function(results, status){
            var city = results[0].address_components[4].long_name.replace(/\s/g, "+"),
                country = results[0].address_components[6].long_name.replace(/\s/g, "+"),
                api = getApiKey(),
                url = getRequestUrl("geo.getmetrohype") + "&limit=10&country="+country+"&metro="+city+"&api_key="+api;
            d3.json(url, function(d){
              if(d.error == 6)
              {
                showError(d.message)
                return;
              }
              var metro = d.topartists["@attr"].metro,
                  resultArray = d.topartists.artist;
              resetGraph();
              updateData(resultArray, "genre", metro)
              initializeGraph(d, data, "artist")
            });
          });
        });
      } else {
        showError()
      }
    } else {
      var metro = extract[3],
          metroInfo = verifyMetro(metro);
      if (typeof metroInfo == "object" && metroInfo !== null)
      {
        var api = getApiKey(),
            url = getRequestUrl("geo.getmetrohype") + "&limit=10&country="+metroInfo.country+"&metro="+metroInfo.metro+"&api_key="+api
        d3.json(url, function(d){
          if(typeof d.error != "undefined")
          {
            showError()
          }
          else if(typeof d.topartists.total != "undefined" && d.topartists.total === "0") 
          {
            showError("No data for "+metro+" at this time.")
          } else {
            resetGraph();
            updateData(d.topartists.artist, "genre", d.topartists["@attr"].metro);
            window.location.hash = "!/hot/"+d.topartists["@attr"].metro
            initializeGraph(d, data, "artist");
          }
        })
      }
      else if(metroInfo == null)
      {
        showError();
      }
      
    }   
  } 
   
  $("#history input").keypress(function(e){
    $(".search_error").hide();
    if(e.which == 13)
    {
      searchCount = 0;
      e.preventDefault();
      //check search type. influences or influenced?
      influenceSearchType();
    }
  });
  
  function influenceSearchType()
  {
    var influencedBy = /\b(influenced)\b\s*[A-z0-9]+(\s[A-z0-9&]*)*/,
        didInfluence = /\b(did)\b\s+([A-z0-9]*)(\s[A-z0-9]*)*\b(influence[?]*)\b/,
        input = $("input#history_name").val(),
        serialInput = input.replace(/\s/, "+");
        
    if(influencedBy.test(input))
    {
      var artist = serialInput.split("+")[1]
      getBeginYear(artist, 1);
    } else if(didInfluence.test(input)) {
      var artist = serialInput.split("+")[1].replace(/\s*\b(influence[?]*)\b/, "")
      getBeginYear(artist, 2)
    } else {
      var artist = input;
      getBeginYear(artist, 1)
    }
  }
  
  function getBeginYear(artist, mode)
  {
    var api = getEchoNestApi();
    var requestUrl = getEchoNestUrl("profile") + "?name="+artist+"&api_key="+api+"&bucket=years_active"
    d3.json(requestUrl, function(d){
      var artist = d.response.artist.name.replace(/\s+/g, "+")
      var beginYear = d.response.artist.years_active[0].start
      if (mode === 1)
      {
        beginYear -= 5;
        influenceSearch(artist, beginYear, 1)
      } else {
        beginYear += 7
        influenceSearch(artist, beginYear, 2)
      }
    })
  }
  
  function influenceSearch(artist, beginYear, mode)
  {
    var api = getEchoNestApi();
    var niceFormatArtist = artist.replace(/\+/g, " ");
    if (mode === 1)
    {
      var requestUrl = getEchoNestUrl("similar") + "?api_key="+api+"&name="+artist+"&results=10&artist_start_year_before="+beginYear
    } 
    else if (mode === 2)
    {
      var requestUrl = getEchoNestUrl("similar") + "?api_key="+api+"&name="+artist+"&results=10&artist_start_year_after="+beginYear
    }
    d3.json(requestUrl, function(d){
      var lastFmBase = "http://last.fm/music/"
      var artistArray = d.response.artists
      resetGraph()
      for(i in artistArray)
      {
        artistArray[i]["match"] = 0.75;
      }
      updateData(artistArray, "artist", niceFormatArtist)
      window.location.hash = mode === 1 ? "!/history/"+artist : "!/history/"+artist+"?mode=2"
      initializeGraph(d, data, "artist")
    })
  }
    
  var currentView = "graph"
  $(".cloud_toggle").click(function(e){
    e.preventDefault();
    //if script isn't loaded
    if(d3.layout.cloud instanceof Object === false)
    {
      $.getScript("./scripts/d3.layout.cloud.js", function(d){
        showTagCloud();
      }).fail(function(xhr, s, c){
        console.log(s,c)
      })
    } else {
      showTagCloud();
    }
    
    function showTagCloud()
    {
      $("svg.graph").fadeToggle();
      if($("svg.cloud").length == 0)
      {
        console.log("search")
        var artist = $("form input").filter(":visible").val().replace(/\s/g, "+"),
            api = getApiKey(),
            url = getRequestUrl("artist.getsimilar") + "&limit=150&artist="+artist+"&format=json&api_key="+api
        d3.json(url, function(d){
          
        })
      }
      
      $("svg.cloud").fadeIn();
      
    }
  })
});