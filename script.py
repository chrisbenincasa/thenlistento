#!/usr/bin/env python
import urllib2, itertools, json
from xml.dom.minidom import parse, parseString

import pprint

#Variable decs
artists_to_return = 1

#First loop, extract titles and ratings
titles,ratings = {},{}

#second loop, place info into aritsts dict for JSON processing
artists = {}
#initialize artists with searched artists
artists[0] = [{"name": "Hot Chip", "rating": float(100), "searched": int(1)}]

#end game: place artists dict into nodes dict, generate links dict (all link to original node)
json_dict, nodes, links = {}, {}, {}

meta = []
index = 0

#Web Viewable
print "Content-Type: text/html;charset=UTF-8\n"

#POST request to Last.fm
def makeRequest():
	#xml = "Content-Type: text/xml\n"
	requestString = "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&limit=%i&artist=hot+chip&api_key=b25b959554ed76058ac220b7b2e0a026" % (artists_to_return)
	f = urllib2.urlopen(requestString)
	xml = f.read()
	f.close()
	return xml

xml = makeRequest()
doc = parseString(xml)

#Grab artist elements
artist = doc.getElementsByTagName("artist")

#iterate over first 10 artist elements
#save artists names and match values to dictionaries

test = []

for a in artist:
	titleObj = a.getElementsByTagName("name")[0]
	ratingObj = a.getElementsByTagName("match")[0]
	index += 1	

pprint.pprint(test)

#iterate over title and ratings DOM objects
#encode titles in utf-8 to preserve accents, etc.
#add to 'similar' dictionary
index = 1
ratingVals = []

for (titleKey, ratingKey) in itertools.izip(titles.keys(), ratings.keys()):
	titleNodes = titles[titleKey].childNodes
	ratingNodes = ratings[ratingKey].childNodes
	for (titleNode, ratingNode) in itertools.izip(titleNodes, ratingNodes):
		utfString = (titleNode.data).encode("utf-8")
		rating = round(float(ratingNode.data)*100,4)
		meta.append({"name": utfString, "rating": rating, "group": int(index) % 10})
		ratingVals.append(rating)
		#artists[index] = [{"name": utfString, "rating": round((float(ratingNode.data))*100,4)}]
	index += 1

nodes["nodes"] = meta
links = []
for x in range(len(meta)):
  links.append({"source": 0, "target": x, "value":ratingVals[x]})
nodes["links"] = links

print json.dumps(nodes)




