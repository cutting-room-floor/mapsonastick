#!/usr/bin/env python

__author__ = 'Tom MacWright (macwright [ -a- ] gmail.com)'
__copyright__ = 'Copyright 2010, Tom MacWright'
__version__ = '0.1'
__license__ = 'BSD'

import sqlite3, urllib2, os, json, sys, base64
from flask import Flask, render_template, request, redirect, url_for
from werkzeug import Response, secure_filename

"""
    Maps on a Stick: a simple tile server
"""

MAPS_DIR = 'Maps'
KML_DIR = 'KML'
UPLOAD_FOLDER = 'KML'
ALLOWED_EXTENSIONS = set(['kml'])

app = Flask(__name__)

def maps_dir():
    if sys.platform == 'darwin' and hasattr(sys, 'frozen'):
        if os.path.exists("../../../%s" % MAPS_DIR):
            return "../../../%s" % MAPS_DIR
    else:
        return MAPS_DIR

def kml_dir():
    if sys.platform == 'darwin' and hasattr(sys, 'frozen'):
        if os.path.exists("../../../%s" % KML_DIR):
            return "../../../%s" % KML_DIR
    else:
        return KML_DIR

def layers_list():
    """ return a json object of layers ready for configuration """
    layers = []
    for root, dirs, files in os.walk(maps_dir()):
        for file in files:
            if os.path.splitext(file)[1] == '.mbtiles':
                layers.append((base64.urlsafe_b64encode(os.path.join(root, file)), file))
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
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            return 'KML saved'
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
    layername = base64.urlsafe_b64decode(str(layername_64))
    conn = sqlite3.connect(layername)
    tile = conn.execute("""
      select tile_data from tiles
      where
        zoom_level = %d and
        tile_column = %d and
        tile_row = %d;""" % (z, x, y))
    return Response(tile.fetchone(), mimetype="image/png")

if __name__ == "__main__":
    app.run(debug=True)
