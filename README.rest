This is mapsona (for the time being). It's a purely client-side little mapping tool aimed at carrying around tilesets and mashing up information with minimal internet connectivity.

= Installation

This is basically it: in its current form, you can download or `git clone` mapsona, and that's it. You'll have to add offline data yourself, by adding KML to the system and by adding tiles in a tiles/1.0.0/layername directory, and then adding these to resources/. This will be a bit easier in the future, but for the time being it is quite straightforward if you're familiar with HTML/CSS.

= Notes

Two big issues with this type of approach are offline saving and bringing in data from the rest of the web. Both are primarily issues of browser security restrictions, and both are difficult to sidestep. Mapsona approaches the former by making the addition of KML to the flash drive or folder simple, and it handles the second by using twFile, a library developed by the {TiddlyWiki}[http://www.tiddlywiki.com/] project that tries to handle cross-browser local file access.

= Uses

* {OpenLayers}[http://www.openlayers.org/]
* {jQuery}[http://jquery.com/]
* {twFile}[http://jquery.tiddlywiki.org/twFile.html]
* {openlayers_plus}[http://github.com/developmentseed/openlayers_plus]

= Browser testing

* Safari 4
* Firefox 3.5.x
* Opera 10
