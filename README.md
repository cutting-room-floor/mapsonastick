This is mapsona, the code that runs Maps on a Stick. It's a purely client-side mapping tool aimed at carrying around tilesets and mashing up information with minimal internet connectivity.

# Installation


# Basic Installation

* Download the mapsona code either with git or as a zip or tgz file from GitHub.
* This code doesn't include any map tiles because of their size: you'll need to
  download them seperately. Here are two tilesets that are freely downloadable:
  [the world up to zoom level 8](http://mapbox-tilesets.s3.amazonaws.com/world-dark-0-8.tgz) and [the world up to zoom level 9](http://mapbox-tilesets.s3.amazonaws.com/world-dark-0-9.tgz). Download one of these (if you aren't sure, up to zoom 8 will be much faster to transfer).
* Download and decompress the tileset: the examples produce a folder called world-dark.
* Move the tileset to the tiles/1.0.0/ directory of the mapsona code. So its path should now be tiles/1.0.0/world-dark/.
* Open index.html in a browser.


# Adding Tiles to a USB Drive


* Quickly making USB drives full of map data is an interesting challenge and is
  more thoroughly documented elsewhere.


# Code that Mapsona uses

* [OpenLayers](http://www.openlayers.org/)
* [jQuery](http://jquery.com/)
* [openlayers_plus](http://github.com/developmentseed/openlayers_plus)
