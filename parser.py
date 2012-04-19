#!/usr/bin/env python
# encoding: utf-8
"""
parser.py

Created by Christian Benincasa on 2012-04-18.
Copyright (c) 2012 __MyCompanyName__. All rights reserved.
"""

import sys
import os

import urllib2, json
import xml.etree.ElementTree

artists_to_return = 10

print "Content-Type: text/html;charset=UTF-8\n"

def makeRequest():
	#xml = "Content-Type: text/xml\n"
	requestString = "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&limit=%i&artist=hot+chip&api_key=b25b959554ed76058ac220b7b2e0a026" % (artists_to_return)
	f = urllib2.urlopen(requestString)
	xml = f.read()
	f.close()
	return xml

myxml = makeRequest()

tree = xml.etree.ElementTree.fromstring(myxml)

test = tree.find("similarartists").findall("artist")

graph = {}
nodes = []

nodes.append({"name": "Hot Chip",
              "rating": "100",
              "url": "http://www.google.com"})

for a in test:
  nodes.append({"name": a.findtext("name"), 
                "rating": round(float(a.findtext("match"))*100,3),
                "url": a.findtext("url") })

graph["nodes"] = nodes

print json.dumps(graph)