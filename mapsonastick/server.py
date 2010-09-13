#!/usr/bin/env python

__author__ = 'Tom MacWright (macwright [ -a- ] gmail.com)'
__copyright__ = 'Copyright 2010, Development Seed'
__version__ = '2.0'
__license__ = 'BSD'

import sqlite3, urllib2, os, sys, base64, zipfile
from flask import Flask, render_template, request, redirect, url_for, send_file
from werkzeug import Response, secure_filename

try:
    import moasutil
except ImportError:
    from mapsonastick import moasutil

try:
    import json
except ImportError:
    import simplejson as json

"""
    Maps on a Stick: a simple tile server
"""

# Maps directory which contains KML, mbtiles, etc.
MAPS_DIR = 'Maps'

DIST = 'mac'

# Extensions of allowed downloads
ALLOWED_EXTENSIONS = set(['kml', 'rss', 'kmz'])

##
# CACHE CLASSES
##

class MapCache(object):
    """ a simple static cache to prevent reconnecting to sqlite """
    def __init__(self):
        self.connections = {}

    def get(self, filename):
        if not self.connections.has_key(filename):
            self.connections[filename] = sqlite3.connect(filename)
        return self.connections[filename]

class KMZFile(object):
    """ items in the KMZCache system: provide accessor methods """
    def __init__(self, filename):
        """ initializes an internal zipfile object and determines whether the
        doc.kml is in the root or a higher-up directory. Note that doc.kml 
        is required."""
        self.zipfile = zipfile.ZipFile(filename)
        try:
            self.docroot = os.path.split([n for n in self.zipfile.namelist() if os.path.basename(n) == 'doc.kml'][0])[0]
        except IndexError:
            raise Exception('doc.kml not found in KMZ file')
    def member(self, filename):
        """ get a file from a kmz archive, relative to the root """
        return self.zipfile.read(os.path.join(self.docroot, filename))

class KMZCache(object):
    """ provides a simple interface for connecting to KMZ files """
    def __init__(self):
        self.kmzs = {}

    def get(self, filename):
        if not self.kmzs.has_key(filename):
            self.kmzs[filename] = KMZFile(os.path.join(maps_dir(), filename))
        return self.kmzs[filename]

map_cache = MapCache()
kmz_cache = KMZCache()

##
# LOGIC FOR WEB FUNCTIONS
##

def maps_dir():
    if DIST == 'mac':
        return "../../../../%s" % MAPS_DIR
    if DIST == 'win':
        return "../%s" % MAPS_DIR
    if DIST == 'dev':
        return "%s" % MAPS_DIR

def layer_entry(file):
    """ return a layer entry for /layers """
    if os.path.splitext(file)[1] in ['.kmz']:
        return {
            'format': 'kml',
            'path': '/kmz/' + base64.urlsafe_b64encode(file) + '/doc.kml',
            'filename': file,
            'kmzBase': '/kmz/' + base64.urlsafe_b64encode(file) + '/'
        }
    if os.path.splitext(file)[1] in ['.kml', '.rss']:
        return {
            'format': 'kml',
            'path': '/kml?url=' + file,
            'filename': file,
            'kmzBase': ''
        }
    if os.path.splitext(file)[1] in ['.mbtiles']:
        l = {
            'format': 'mbtiles',
            'path': base64.urlsafe_b64encode(os.path.join(maps_dir(), file)),
            'filename': file,
        }
        l.update(moasutil.restrictions(os.path.join(maps_dir(), file)))
        return l

def layer_valid(file):
    """ filter layers to prevent .DS_Store, etc. files from
    causing problems. """
    return (os.path.splitext(file)[1] in ['.mbtiles', '.kml', '.rss', '.kmz']) and not os.path.basename(file).startswith('.')

def layers_list():
    """ return a json object of layers ready for configuration """
    for root, dirs, files in os.walk(maps_dir()):
        return map(layer_entry, filter(layer_valid, files))

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

##
# WEB-EXPOSED FUNCTIONS
##

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    """ serve the home page """
    return render_template('start.html')
  
@app.route(
    '/kmz/<string:filename_64>/<path:member>', methods=['GET'])
def kmz(filename_64, member):
    """ access to parts of a KMZ file as if they were not compressed """
    try:
        filename = "%s" % base64.urlsafe_b64decode(str(filename_64))
        zip_file = kmz_cache.get(filename)
        return zip_file.member(member)
    except Exception, e:
        return str(e)

@app.route('/kml', methods=['GET', 'POST'])
def kml():
    """ proxy an external kml file """
    if request.method == 'POST':
        file = request.files['kml-file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(maps_dir(), filename))
            return redirect(url_for('home', added_file=filename))
        else:
            return 'File not allowed'
    else:
        try:
            url = request.args.get('url', False)
            if os.path.isfile(os.path.join(maps_dir(), url)):
                return send_file(open(os.path.join(maps_dir(), url), 'rb'))
            else:
                return send_file(open(os.path.join('static', url), 'rb'))
        except Exception, e:
            return str(e)

@app.route('/proxy', methods=['GET'])
def proxy():
    """ general-purpose proxy used for cross-domain KML """
    url = request.args.get('url', False)
    if url:
        return urllib2.urlopen(url).read()

@app.route('/layers', methods=['GET'])
def layers():
    """ layers callback: returns information about map layers in MAPS_DIR """
    try:
        return Response(json.dumps({'layers': layers_list()}))
    except Exception, e:
        return str(e)

@app.route(
    '/tiles/1.0.0/<string:layername_64>/<int:z>/<int:x>/<int:y>.png', 
    methods=['GET'])
def tile(layername_64, z, x, y):
    """ serve a tile request """
    layername = "%s" % base64.urlsafe_b64decode(str(layername_64))
    if not os.path.isfile(layername):
        return "Map file not found: %s" % layername
    try:
        return Response(map_cache.get(layername).execute("""
          select tile_data from tiles
          where
            zoom_level = %d and
            tile_column = %d and
            tile_row = %d;""" % (z, x, y)).fetchone(),
            mimetype="image/png")
    except Exception, e:
        return "Tile could not be retrieved: %s" % str(e)

##
# SERVER BOOTER
##

if __name__ == "__main__":
    """ since flask spawns a new process when run from the mac terminal,
    write a pid file to keep track of this process """
    if sys.platform == 'darwin':
        spid = open('server.pid', 'w')
        spid.write("%s\n" % str(os.getpid()))
        spid.close()
    app.config['SERVER_NAME'] = 'localhost'
    app.run()
