# ThenListenTo

#### Music Recommendation Visualization

##Overview

[ThenListenTo](http://www.thenlistento.com) is an HTML5-based, music recommendation visualizer. ThenListenTo takes advantage of the [d3](http://d3js.org/) library to create interesting visualizations of music data. The recommendations are based on queries to the Last.fm and EchoNest databases

The system can detect different queries based on phrases and tags. The user can search for an artist just by searching the artist name. However, if the user wishes to search for specific track recommendations, they can enter a track by a particular artist in the form "{track} by {band}". ThenListenTo then knows to search specifically for recommendations based on that track. See below for a full list of supported commands, as well as planned commands.

Node sizes are based on the percent match of the returned similar artists. If a node is clicked, a new search is performed on the artist represented by that node and the results are appended to the existing graph. 

##Supported Browsers
* Chrome 17+
* Firefox 3.6+
* IE9+
* Opera 12
* Safari 5.0+
* iOS Safari 3.2+
* Android Browser 2.1+

##Commands

As mentioned in the overview, ThenListenTo can understand a variety of different commands. Visit the [wiki](https://github.com/chrisbenincasa/thenlistento/wiki) to see all of the commands that Then Listen To offers!

##Features to be Added

* ~~Proper error handling~~
* Advanced Search Options  
    * ~~Number of artists to return~~
    * Search for multiple artists
    * Color
* Caching of results for faster request times  
* Artist image in nodes  
* ~~Prettier interface~~ 