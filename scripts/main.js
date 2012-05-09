$(document).ready(function(){
  //Hash search
  if(window.location.hash.length)
  {
    var hash = window.location.hash;
    hash = hash.split("/");
    var query = hash[1].split("&");
    if(hash.length > 2)
    {
      if(query[0] === "history")
      {
        switchSearch($("#history_search"))
        $("input#history_name").val("influenced " + hash[2].replace(/[+]/g, " "))
        getBeginYear(hash[2], 1)
      }
    } else {  
      if(query.length === 2)
      {
        var param = query[1].split("=");
        if(param[0] === "limit")
        {
          $("input#limit").val(param[1]);
        }
      }
      var urlSearch = query[0].replace(/[+]/g, " ");
      $("input#name").val(urlSearch);
      search();
    }
  }
  
  //Handlers
  $("#advanced_search").click(function(){
    $("#adv_search_opts").slideToggle(400, "easeOutCubic");
  });
  
  $(".about_link").click(function(e){
    //$("#black_overlay").fadeIn();
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
    switchSearch($(e.currentTarget));
  });

  function switchSearch(el)
  {
    var visible = $("form:visible")
    var clicked = el.attr("rel");
    if($("form#"+clicked).is(":visible"))
    {
      return
    } else {
      visible.fadeOut("fast", function(e){
        $("form#"+clicked).fadeIn("fast")
      })
    }
  }
  
  $(".help_tabs li a").click(function(e){
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
        if(link.hasClass(tabs[0]))
        {
          $(".artists_help_content").show(0, function(){
            $(this).addClass("active");
          });
        }
        else if(link.hasClass(tabs[1]))
        {
          $(".tracks_help_content").show(0, function(){
            $(this).addClass("active");
          });
        } else if(link.hasClass(tabs[2])) {
          $(".genres_help_content").show(0, function(){
            $(this).addClass("active");
          });
        } else {
          $(".more_help_content").show(0, function(){
            $(this).addClass("active");
          });
        }
      });
    }  
  });
  
  $(".help_content a.example").click(function(e){
    e.preventDefault();
    $("input#name").val(stripTags($(this).html(), "strong"));
    $("#help").slideToggle(400, "easeOutCubic");
    search();
  });
  
  function changePlaceholder()
  {
    if(!searchInput.is(":focus"))
    {
      placeholders = ["The Beatles", "genre: rock", "15 Step by Radiohead"];
      searchInput.attr("placeholder", placeholders[index]);
      if(index === placeholders.length)
      {
        index = 0;
      } else {
        index++;
      }
    }
  }
  
  /* Helpers */
  var searchCount = 0,
      svg = d3.select("svg.graph"),
      force,
      node,
      link,
      data = {};
  
  function resetGraph()
  {
    if(typeof force === "object")
    {
      node.data([]).exit().remove()
      link.data([]).exit().remove()
    }

    force = d3.layout.force()
      .charge(function(d){return -d.match * 50;})
      .linkDistance(function(d){return 15*Math.sqrt(d.target.match)})
      .size([960,720])
      .on("tick", tick);
  }
  
  $("#band_search input").keypress(function(e){
    searchCount = 0;
    $(".limit_error").hide();    
    if(e.which == 13)
    {
      e.preventDefault();
      $(".graph").fadeOut(100);      
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
    var inputLimit = $("input#limit").val();
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
    var limitHash = $("input#limit").val()
    window.location.hash = (limitHash.length > 0) ? "!/"+serial+"&limit="+limitHash : "!/"+serial
    
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
          trackSearchFunc(inputLimit, false, null);
          break;
        case 1:
          trackSearchFunc(inputLimit, true, null);
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
  }
  
  function searchType(query)
  {
    var expressions = {"trackSearch" : /(([A-z0-9]+)\s*)+\bby\b\s([A-z0-9]+\s*)+/,
                       "trackOnlySearch": /\b(track|song)\b:\s*([A-z0-9]+\s*)+/,
                       "genreSearch": /\b(genre|mood|tag)\b:\s*[A-z0-9]+(\s[A-z0-9&]*)*/,
                       "artistSearch": /\b(artist|band)\b:\s*[A-z0-9]+(\s[A-z0-9&]*)*/,
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
        showError();
        $("input#name").focus();
      }
      var artists = d.similarartists.artist      
      updateData(artists, "artist", d.similarartists["@attr"].artist)
      initializeGraph(d, data, "artist")      
    });
  }
  
  function trackSearchFunc(inputLimit, trackOnly, extraInfo)
  {
    if(!trackOnly)
    {
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
      
      var api = getApiKey(),
        getUrl = getRequestUrl("track.getsimilar") + "&artist="+artist+"&autocorrect=1&track="+track+"&api_key="+api+"&limit="+inputLimit+"&format=json"
    
      resetGraph()
      
      d3.json(getUrl, function(d){
        if(typeof d.error != "undefined")
        {
          showError();
        } else {
          var similarTracks = d.similartracks.track
          var searchedArray = d.similartracks["@attr"]
          updateData(similarTracks, "track", searchedArray)
          initializeGraph(d, data, "track")
        }
      })
    }
  }
  
  function genreSearchFunc(inputLimit)
  {
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
        "id"    : "node_"+(Date.now()).toString()
        })
    }
    else if (mode === "artist" || mode === "hot")
    {
      data["nodes"].push({
        "name"  : toTitleCase(extraInfo),
        "match" : 100,
        "id"    : "node_"+(Date.now()).toString()
      })
    } else if (mode === "track")
    {
      data["nodes"].push({
        "name"  : toTitleCase(extraInfo["track"]),
        "artist": toTitleCase(extraInfo["artist"]),
        "match" : 100,
        "id"    : "node_"+(Date.now()).toString()
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
        "id"    : "node_"+(Date.now()+i).toString()
      })
      var currentLength = data["nodes"].length
      if(mode === "track")
      {
        data["nodes"][currentLength-1]["artist"] = infoArray[i].artist.name
      }
    }
    
    for(var i = 0; i < data["nodes"].length; i++)
    {
      data["links"].push({"source": 0, "target": i})
    }
    
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
      .attr("class", "link")
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
    
    node.transition()
     .delay(1200)
     .duration(150)
     .attr("r", function(d){return 1.33*Math.sqrt(d.match)})
     
    link.transition()
     .delay(1500)
     .duration(150)
     .style("stroke-width", 1.1)
     .style("stroke", "rgba(0,0,0,0.5)")
     
    $(".graph").fadeIn(100)
    
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
  
  $(document).on("mouseover", "circle", function(e)
    {
       n = e.target.__data__;
       var radius = 1.33*Math.sqrt(n.match)
       var hoverName = svg.select("g.names").append("text")
        .style("text-anchor", "middle")
        .attr("x", n.x)
        .attr("y", n.y + (radius + 17))
        .attr("class", n.id + " name")
        .text(n.name)
        .style("font-size", "0px")      
        
        hoverName.transition().style("font-size", "14px")
      if(typeof n.artist != "undefined")
      {
        var hoverArtist = svg.select("g.names").append("text")
          .style("text-anchor", "middle")
          .attr("x", n.x)
          .attr("y", n.y - (radius + 7))
          .attr("class", n.id + " name")
          .text(n.artist)
          .style("font-size", "0px")
          .transition().style("font-size", "14px")
      }
      console.log(hoverName[0])
      var xPos = ~~(n.x),
          yPos = ~~(n.y)

      node.each(function(d,i){
        var diffX = xPos - ~~(d.x),
            diffY = yPos - ~~(d.y)
            hypo = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2))
        if(hypo < 200)
        {
          if(n.index !== d.index)
          {
            svg.select("."+d.id).classed("faded", "faded").transition().style("opacity", "0.5");
          }
        }
      })
        
    });
   
   $(document).on("mouseout", "circle", function(e){
     n = e.target.__data__;
     svg.selectAll("text."+n.id).remove();
     svg.selectAll("circle.faded").classed("faded", "").transition().style("opacity", "1.0");
   })
   
  function addNodes(d, n)
  {
    var artists = d.similarartists.artist,
        indexes = []
    node.each(function(a,j){
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
        "name": artists[i].name,
        "match": artists[i].match*100,
        "url": artists[i].url,
        "id": "node_"+(Date.now() + i).toString()
      })            

      data["links"].push({
        "source": n.index,
        "target": data["nodes"].length - 1 
      })     
     }      
     node = svg.select("g.nodes").selectAll("circle.node")
       .data(data["nodes"])

     node.exit().remove()

     node.enter().append("circle")
     .attr("class", function(d){return "node "+d.id})
     .attr("r", 0)
     .style("fill", function(i){return "#"+Math.floor(Math.random()*16777215).toString(16);})
     .call(force.drag)

     //node.append("title").text(function(d){return d.name})

     link = svg.select("g.links").selectAll("line.link")
       .data(data["links"])

     link.exit().remove()

     var newLinks = link.enter().append("line")
     .attr("class", "link")
     .style("stroke-width", 1.1)
     .style("stroke", "#fff")
     .attr("x1", function(d){return d.source.x})
     .attr("y1", function(d){return d.source.y})
     .attr("x2", function(d){return d.target.x})
     .attr("y2", function(d){return d.target.y})

     force.nodes(data["nodes"]).links(data["links"])
       .start()
       .charge(-400)
       .alpha(0.4)
       .friction(0.65);

     node.transition()
       .duration(150)
       .delay(function(d,i){return i*20})
       .attr("r", function(d){return 1.33*Math.sqrt(d.match)})

     link.transition()
       .duration(65)
       .delay(function(d,i){return i*20})
       .attr("stroke-width", 1.1)
       .style("stroke", "#666")

     node.on("dblclick", function(n){window.location = "http://"+n.url})

    }   
    
    function tick(d,i)
    {
     link.attr("x1", function(d){return d.source.x})
        .attr("y1", function(d){return d.source.y})
        .attr("x2", function(d){return d.target.x})
        .attr("y2", function(d){return d.target.y})

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      
      //names.attr("x", function(d){console.log(d)})
    }   
    
    $("#tell_me_form input").keypress(function(e){
      if(e.which == 13)
      {
        e.preventDefault();
        var whoIsHot = /(what[']*s)\s\b(hot|good|new|popular)\b/,
            locationSearch = /(in|around|near)\s(([A-z0-9]+)\s*([A-z0-9]+\s*)+)*/,
            query = $("input#tell_name").val()

        if(whoIsHot.test(query))
        {
          if(locationSearch.test(query))
          {
            var extract = query.match(locationSearch)
            alert("searching for stuff")
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
        initializeGraph(d, data, "artist")
      })
    }
     
    $("#history_form input").keypress(function(e){
      if(e.which == 13)
      {
        e.preventDefault();
        //check search type. influences or influenced?
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
    });
    
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
      
});