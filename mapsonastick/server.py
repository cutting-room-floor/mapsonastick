#!/usr/bin/env python

__author__ = 'Tom MacWright (macwright [ -a- ] gmail.com)'
__copyright__ = 'Copyright 2010, Tom MacWright'
__version__ = '0.1'
__license__ = 'BSD'

import sqlite3, urllib2
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

@app.route('/layers')
def layers():
    """ return a json object of layers ready for configuration """
    pass

@app.route('/tiles/1.0.0/<string:layername>/<int:z>/<int:x>/<int:y>.png')
def tile(layername, z, x, y):
    """ serve a tile request """
    conn = sqlite3.connect('World-Light_z0-10_v1.mbtiles')
    tile = conn.execute("""
      select tile_data from tiles
      where
        zoom_level = %d and
        tile_column = %d and
        tile_row = %d;""" % (z, x, y))
    return Response(tile.fetchone(), mimetype="image/png")

if __name__ == "__main__":
    app.run(debug=True)
