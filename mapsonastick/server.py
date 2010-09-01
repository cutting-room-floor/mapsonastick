#!/usr/bin/env python

__author__ = 'Tom MacWright (macwright [ -a- ] gmail.com)'
__copyright__ = 'Copyright 2010, Tom MacWright'
__version__ = '0.1'
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

MAPS_DIR = 'Maps'
KML_DIR = 'KML'
ALLOWED_EXTENSIONS = set(['kml', 'rss'])

app = Flask(__name__)

class MapCache(object):
    """ a simple static cache to prevent reconnecting to sqlite """
    def __init__(self):
        self.connections = {}

    def get(self, filename):
        if not self.connections.has_key(filename):
            self.connections[filename] = sqlite3.connect(filename)
        return self.connections[filename]

class KMZFile(object):
    def __init__(self, filename):
        self.zipfile = zipfile.ZipFile(filename)
        try:
            self.docroot = os.path.split([n for n in self.zipfile.namelist() if os.path.basename(n) == 'doc.kml'][0])[0]
        except IndexError, e:
            raise Exception('doc.kml not found in KMZ file')
    def member(self, filename):
        return self.zipfile.read(os.path.join(self.docroot, filename))

class KMZCache(object):
    """ provides a simple interface for connecting to KMZ files """
    def __init__(self):
        self.kmzs = {}

    def get(self, filename):
        if not self.kmzs.has_key(filename):
            self.kmzs[filename] = KMZFile(os.path.join('KML', filename))
        return self.kmzs[filename]

map_cache = MapCache()
kmz_cache = KMZCache()

def maps_dir():
    if sys.platform == 'darwin' and False:
        return "../../../%s" % MAPS_DIR
    else:
        return MAPS_DIR

def kml_dir():
    if sys.platform == 'darwin' and False:
        return "../../../%s" % KML_DIR
    else:
        return KML_DIR

def layer_entry(file):
  if os.path.splitext(file)[1] in ['.kmz', '.kml', '.rss', '.mbtiles']:
    if os.path.splitext(file)[1] == '.kmz':
      path = '/kmz/' + base64.urlsafe_b64encode(file) + '/doc.kml'
    else:
      # TODO: use proper routing
      path = '/kml?url=' + file
    return {
      'path': path,
      'filename': file
    }

def layers_list():
    """ return a json object of layers ready for configuration """
    layers = []
    for root, dirs, files in os.walk(maps_dir()):
        for file in filter(lambda l: os.path.splitext(l)[1] == '.mbtiles' and not l.startswith('.'), files):
            try:
                layer = {
                  'path': base64.urlsafe_b64encode(os.path.join(root, file)),
                  'filename': file
                }
                layer.update(moasutil.restrictions(os.path.join(root, file)))
                layers.append(layer)
            except:
                pass
    for root, dirs, files in os.walk(kml_dir()):
        overlays = map(layer_entry, files)
    return {'layers': layers, 'overlays': overlays}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    """ serve the home page """
    return render_template('start.html')
  
@app.route('/kmz/<string:filename_64>/<path:member>')
def kmz(filename_64, member):
  filename = "%s" % base64.urlsafe_b64decode(str(filename_64))
  zip_file = kmz_cache.get(filename)
  return zip_file.member(member)

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
        try:
            url = request.args.get('url', False)
            if os.path.isfile(os.path.join(kml_dir(), url)):
                return send_file(open(os.path.join(kml_dir(), url), 'rb'))
            else:
                return send_file(open(os.path.join('static', url), 'rb'))
        except Exception, e:
            return str(e)

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
    app.config['SERVER_NAME'] = 'localhost'
    app.run(debug=True)
