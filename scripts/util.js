function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function getApiKey()
{
  return "1a144ff8653821952e65b0cda2fef616"
}

function getRequestUrl(method)
{
  switch(method)
  {
    case "tag.gettopartist":
      return "http://ws.audioscrobbler.com/2.0/?method=tag.gettopartists"
    case "track.getsimilar":
      return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar"
    case "artist.getsimilar":
      return "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar"
  }
}