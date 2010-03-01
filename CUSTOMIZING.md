Customizing Maps on a Stick

Documentation Version 1

The initial distribution of Maps on a Stick is only an example, and is made to be modified with new data and layers for any purpose imaginable. Doing so requires some knowledge of Javascript, but given that requirement, it is quite straightforward.

## Adding new KML Layers

Although Maps on a Sticks supports the addition of KML layers on the fly by dropping them in the 'My KML' folder and then adding them with the user interface, for some applications KML layers should be on the map when it's loaded.

In order to make this work, simply add the KML layers to the 'My KML' folder and edit `system/resources/layers.js`. There's a snippet of Javascript at the bottom of the file which is surrounded by comments (`/* and */`), and can be copied out of those comments and added to the space directly above to add a layer to the map on initialization. Then edit the path to the layer and the layer name as desired. Note that the path to the KML file should be changed by changing the filename, and keeping the path the same - setting this path to something absolute (like `C:\Files\kml.kml`) will cause the application to break on other systems and possibly when the drive is ejected and plugged in again.

## Adding new Tile Layers

Maps on a Stick ships with a basic, world-covering tileset, but adding a new tileset is similarly simple as long as you can produce one. More tilesets may be released by MapBox.com, and they can be created with the TileMill AMI or with a similar setup that produces static tile sets. Once you have a tileset created, add it to the folder `/tiles/1.0.0/` so that, for a tileset named `world-red`, it forms the path `/tiles/1.0.0/world-red/`, and the path `/tiles/1.0.0/world-red/0/0.png` for the first tile. Then duplicate the layer type contained in the `system/resources/layers.js` file to add this layer to the map on load. To add layers of a different type, like TMS, OSM, or WMS, see the top of the `layers.js` file or [OpenLayers.org](http://openlayers.org/) for more information.s