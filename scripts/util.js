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

function showError()
{
  $(".search_error").fadeIn("fast")
}

function stripTags(string, tag) 
{
  var tagMatcher = new RegExp('</?' + tag + '>','g');
  return string.replace(tagMatcher, '');
}

function scaleNode(searchCount)
{
  return Math.sqrt(searchCount*0.33 + 1)
}

function nodeWidth(nodeWeight, searchCount)
{
  var scale = scaleNode(searchCount)
  return (2.0*Math.sqrt(1.5*nodeWeight))/scale
}

function scaleNodes(sys, searchCount)
{
  sys.eachNode(function(node, pt){
    node.data.weight = nodeWidth(node.data.weight, searchCount)
  })
}