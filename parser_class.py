#!/usr/bin/env python
# encoding: utf-8
"""
parser_class.py

Created by Christian Benincasa on 2012-04-23.
Copyright (c) 2012 __MyCompanyName__. All rights reserved.
"""

import sys
import os
import urllib2, cgi, xml.etree.ElementTree
try:
    import json
except ImportError:
    import simplejson as json

class LastFmQuery(object):
  """docstring for LastFmQuery"""
  def __init__(self, apikey, options = {"artist" : "", "limit" : 10 }):
    super(LastFmQuery, self).__init__()
    self.options = options
    self.options["apikey"] = apikey
  
  def getOptions(self):
    return self.options
    
  def printOptions(self):
    print self.getOptions()
  
  def setOptions(self, options):
    self.options = options
    
  def getSimilar(self):
    requestString = "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&limit=%i&artist=%s&api_key=%s" % (self.options["limit"], self.options["artist"], self.options["apikey"])
    requestString = requestString.replace(" ", "+")
    f = urllib2.urlopen(requestString)
    xml = f.read()
    f.close()
    return xml

print "Content-Type: text/html;charset=UTF-8\n"

data = cgi.FieldStorage()
options = {"artist": data["artist"].value.title(), "limit": int(data["limit"].value)}
apikey = "1a144ff8653821952e65b0cda2fef616"

myRequest = LastFmQuery(apikey, options)

xmlReturn = myRequest.getSimilar()

tree = xml.etree.ElementTree.fromstring(xmlReturn)

test = tree.find("similarartists").findall("artist")

graph = {}
nodes = []

nodes.append({"name": data["artist"].value.title(),
              "rating": "100",
              "url": "http://www.google.com"})

for a in test:
  nodes.append({"name": a.findtext("name"), 
                "rating": round(float(a.findtext("match"))*100,3),
                "url": a.findtext("url") })

graph["nodes"] = nodes

print json.dumps(graph)
