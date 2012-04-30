# ThenListenTo

#### Music Recommendation Visualization

##Overview

ThenListenTo is an HTML5-based, music recommendation visualizer. ThenListenTo takes advantage of the [arbor.js](https://github.com/samizdatco/arbor) library to create interesting visualizations of music data. The recommendations are based on queries to the Last.fm database. Research into the EchoNest API is also being performed to see if there are ways to offer better results.

The system can detect different queries based on phrases and tags. The user can search for an artist just by searching the artist name. However, if the user wishes to search for specific track recommendations, they can enter a track by a particular artist in the form "{track} by {band}". ThenListenTo then knows to search specifically for recommendations based on that track. See below for a full list of supported commands, as well as planned commands.

Node sizes are based on the percent match of the returned similar artists. If a node is clicked, a new search is performed on the artist represented by that node and the results are appended to the existing graph. 

##Commands

As mentioned in the overview, ThenListenTo can understand a variety of different commands. Here is the current list of supported commands, as well as commands that are being implemented.

###Supported Commands

Eventually, this section will be moved to the wiki.

Curly braces are used to delimit variable input and are not actually included in the query.

Variable input is not case-sensitive.

* Artist search
  * {artist/band name}
  * artist: {artist/band name}
* Track search
  * {track name} by {artist/band name}
  * {track name}
* Genre/Tag search
  * genre: {genre name}
  * tag: {tag name}
  * mood: {mood name}
  
###Exmaples

* Artist search
  * The Beatles
  * artist: Radiohead
* Track search
  * Stairway to Heaven
  * 15 Step by Radiohead
* Genre/Tag Search
  * genre: rock
  * tag: fast
  * mood: happy

##Features to be Added

* ~~Proper error handling~~
* Advanced Search Options  
    * ~~Number of artists to return~~
    * Search for multiple artists
    * Color
* Caching of results for faster request times  
* Artist image in nodes  
* ~~Prettier interface~~ 