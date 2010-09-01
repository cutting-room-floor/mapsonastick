### Maps on a Stick

Maps on a Stick is a lightweight mapping solution for mobile, unplugged maps.

MapBox tilesets - rendered map tiles stored in structured SQLite databases - 
are supported, as well as KML input.

File-based tilesets, as used in the previous version of Maps on a Stick, are 
not supported.

### Using Maps on a Stick

1. Download the main maps on a stick application
2. Run Maps.app on Macintosh or Maps.exe on Windows

### Usage

Add map tiles by dropping `.mbtiles` files into the `Maps/` folder and KML
by dropping KML files into the `KML/` folder, specifying a URL in the UI, or
uploading files with the web interface.

### KMZ Support

Maps on a Stick, unlike bare OpenLayers, supports KMZ files, by simulating 
their unpacking and using a special KMZ format type to prefix paths so that 
they resolve. This has only been tested with Icons.

### Requirements (Running)

#### Mac & Windows

* A .mbtiles mapfile

### Requirements (Building)

#### Mac

* [py2app](http://svn.pythonmac.org/py2app/py2app/trunk/doc/index.html)
* [löve](http://love2d.org/)
* [flask](http://flask.pocoo.org/)

#### Windows

* [py2exe](http://www.py2exe.org/)
* [flask](http://flask.pocoo.org/)

### Layout

* `launcher` Lua code and included resources (icons and shell scripts) for the launcher application
* `launcher_dist` Distribution files to polish the Mac application bundle for the launcher
* `mapsonastick` The Maps on a Stick server module in Python
* `dist`, `build` Working directories for packaging the application as an executable

### Licenses

* This work is distributed under the GPL license, (c) 2010, Development Seed
* Löve: zlib 
* Flask: BSD 
* py2app: MIT
* pyexe: MIT
