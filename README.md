# ThenListenTo

#### Music Recommendation Visualization

##Overview

ThenListenTo is an HTML5-based, music recommendation visualizer. The system is built upon several libraries with Python in back and jQuery up front. ThenListenTo takes advantage of the [arbor.js](https://github.com/samizdatco/arbor) library as well as many built in libraries for Python. The recommendations are based on queries to the LastFm database. Research into the EchoNest API is also being performed to see if there are ways to offer better results.

Node sizes are based on the percent match of the returned similar artists. If a node is clicked, a new search is performed on the artist represented by that node and the results are appended to the existing graph. 

##Features to be Added

-Advanced search options  
  ~Number of artists to return  
  ~Search for multiple artists?  
  ~Color  
-Caching of results for faster request times  
-Artist image in nodes  
-Prettier interface  