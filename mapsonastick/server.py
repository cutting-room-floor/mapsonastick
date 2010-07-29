#!/usr/bin/env python

__author__ = 'Tom MacWright (macwright [ -a- ] gmail.com)'
__copyright__ = 'Copyright 2010, Tom MacWright'
__version__ = '0.1'
__license__ = 'BSD'

import sqlite3, urllib2, os, json, sys, base64, moasutil
from flask import Flask, render_template, request, redirect, url_for
from werkzeug import Response, secure_filename

"""
    Maps on a Stick: a simple tile server
"""

MAPS_DIR = 'Maps'
KML_DIR = 'KML'
ALLOWED_EXTENSIONS = set(['kml'])

app = Flask(__name__)

class MapCache(object):
    def __init__(self):
        self.connections = {}

    def get(self, filename):
        if not self.connections.has_key(filename):
            self.connections[filename] = sqlite3.connect(filename)
        return self.connections[filename]

map_cache = MapCache()

def maps_dir():
    if sys.platform == 'darwin' and True:
        return "../../../%s" % MAPS_DIR
    else:
        return MAPS_DIR

def kml_dir():
    if sys.platform == 'darwin' and True:
        return "../../../%s" % KML_DIR
    else:
        return KML_DIR

def layers_list():
    """ return a json object of layers ready for configuration """
    layers = []
    for root, dirs, files in os.walk(maps_dir()):
        for file in files:
            if os.path.splitext(file)[1] == '.mbtiles':
                layers.append(
                    (base64.urlsafe_b64encode(os.path.join(root, file)), file, 
                      moasutil.bounds(os.path.join(root, file))))
    overlays = []
    for root, dirs, files in os.walk(kml_dir()):
        for file in files:
            if os.path.splitext(file)[1] == '.kml':
                overlays.append(file)
    return {'layers': layers, 'overlays': overlays}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    """ serve the home page """
    return render_template('start.html')

@app.route('/kml', methods=['GET', 'POST'])
def kml():
    """ proxy an external kml file """
    if request.method == 'POST':
        file = request.files['kml-file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(kml_dir(), filename))
            return redirect(url_for('home', added_file=filename))
        else:
            return 'File not allowed'
    else:
        url = request.args.get('url', False)
        return open(os.path.join(kml_dir(), url)).read()


@app.route('/proxy', methods=['GET'])
def proxy():
    url = request.args.get('url', False)
    if url:
        return urllib2.urlopen(url).read()

@app.route('/layers', methods=['GET'])
def layers():
    return Response(json.dumps(layers_list()))

@app.route('/tiles/1.0.0/<string:layername_64>/<int:z>/<int:x>/<int:y>.png')
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

if __name__ == "__main__":
    """ since flask spawns a new process when run from the mac terminal,
    write a pid file to keep track of this process """
    if sys.platform == 'darwin':
        spid = open('server.pid', 'w')
        spid.write("%s\n" % str(os.getpid()))
        spid.close()
    app.run()
