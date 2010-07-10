#!/usr/bin/env python

__author__ = 'Tom MacWright (macwright [ -a- ] gmail.com)'
__copyright__ = 'Copyright 2010, Tom MacWright'
__version__ = '0.1'
__license__ = 'BSD'

import sqlite3, urllib2, os, json
from flask import Flask, render_template
from werkzeug import Response

"""
    Maps on a Stick: a simple tile server
"""

app = Flask(__name__)

@app.route('/')
def home():
    """ serve the home page """
    return render_template('start.html')

@app.route('/kml')
def kml():
    """ proxy an external kml file """
    url = get['kml'] # TODO: rewrite
    remote_file = urllib2.urlopen(url)

def layers_list():
    """ return a json object of layers ready for configuration """
    layers = []
    for root, dirs, files in os.walk('maps'):
        for file in files:
            print file
            if os.path.splitext(file)[1] == '.mbtiles':
                # TODO: layer files should include their own titles
                layers.append(('world-light', file))
    return layers

@app.route('/layers')
def layers():
    return Response(json.dumps(layers_list()))

@app.route('/tiles/1.0.0/<string:layername>/<int:z>/<int:x>/<int:y>.png')
def tile(layername, z, x, y):
    """ serve a tile request """
    conn = sqlite3.connect('maps/World-Light_z0-10_v1.mbtiles')
    tile = conn.execute("""
      select tile_data from tiles
      where
        zoom_level = %d and
        tile_column = %d and
        tile_row = %d;""" % (z, x, y))
    return Response(tile.fetchone(), mimetype="image/png")

if __name__ == "__main__":
    app.run(debug=True)
