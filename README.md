# Maps on a Stick

Maps on a Stick is a lightweight mapping solution for mobile, unplugged maps.

It includes a launcher, called `runner.py`, that wraps functionality for 
usage via a GUI.

MapBox tilesets - rendered map tiles stored in structured SQLite databases - 
are supported, as well as KML input.

File-based tilesets, as used in the previous version of Maps on a Stick, are 
not supported.

# Using Maps on a Stick

1. Download the main maps on a stick application
2. Run Maps.app on Macintosh or Maps.exe on Windows

This work is distributed under the GPL license, (c) 2010, Development Seed

Requirements (Running)

# Mac & Windows

* A .mbtiles mapfile

Requirements (Building)

# Mac

* [py2app](http://svn.pythonmac.org/py2app/py2app/trunk/doc/index.html)
* [löve](http://love2d.org/)
* [flask](http://flask.pocoo.org/)

# Windows

* [py2exe](http://www.py2exe.org/)
* [flask](http://flask.pocoo.org/)