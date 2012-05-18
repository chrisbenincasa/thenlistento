//Misc. Utility functions for cleaner main_branch.js

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function getApiKey()
{
  return "1a144ff8653821952e65b0cda2fef616"
}

function getEchoNestApi()
{
  return "8S6ECJEMIGXABYTXE"
}

function getGoogleApi()
{
  return "AIzaSyAB7n-BQCLR3ZoDirh8c6omfsGSId3rvcw";
}

function getRequestUrl(method)
{
  switch(method)
  {
    case "tag.gettopartist":
      return "http://ws.audioscrobbler.com/2.0/?method=tag.gettopartists"
    case "artist.getcorrection":
      return "http://ws.audioscrobbler.com/2.0/?method=artist.getcorrection"
    case "track.getsimilar":
      return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar"
    case "artist.getsimilar":
      return "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar"
    case "track.search":
      return "http://ws.audioscrobbler.com/2.0/?method=track.search"
    case "chart.gethypedartists":
      return "http://ws.audioscrobbler.com/2.0/?method=chart.getHypedArtists"
    case "geo.getmetrohype":
      return "http://ws.audioscrobbler.com/2.0/?method=geo.getmetrohypeartistchart&format=json"
    case "geo.getmetros":
      return "http://ws.audioscrobbler.com/2.0/?method=geo.getMetros&format=json"
  }
}

function getEchoNestUrl(method)
{
  switch(method)
  {
    case "profile":
      return "http://developer.echonest.com/api/v4/artist/profile"
    case "similar":
      return "http://developer.echonest.com/api/v4/artist/similar"
  }
}

function showError(message)
{
  message = (typeof message == "undefined") ? null : message
  if(message != null)
  {
    $(".search_error").html(message).fadeIn("fast");
  } else {
    $(".search_error").fadeIn("fast");
  }
}

function stripTags(string, tag) 
{
  var tagMatcher = new RegExp('</?' + tag + '>','g');
  return string.replace(tagMatcher, '');
}

function verifyMetro(query)
{
  var api = getApiKey(),
      url = getRequestUrl("geo.getmetros")+"&api_key="+api,
      match = null;
  $.ajax({
    url: url,
    type: "GET",
    async: false,
    dataType: "json",
    success: function(result)
    {
      query = toTitleCase(query).replace(/\./g, "")
      var metros = result.metros.metro,
          queryPattern = new RegExp(query, "i")
      for(key in metros)
      {
        if(queryPattern.test(metros[key].name))
        {
          match = {"country": metros[key].country,
                    "metro"  : metros[key].name}
        }
        else if(query === metros[key].country)
        {
          match = true;
        }
      }
    }
  })
  return match;
}

function loadGoogleMaps() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyAB7n-BQCLR3ZoDirh8c6omfsGSId3rvcw&sensor=true&callback=mapsLoaded";
  document.body.appendChild(script);
}