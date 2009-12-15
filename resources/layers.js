/*
 * mapsona layer definitions
 *
 * Layers defined here will appear on the map on
 * initial pageloads: you can dynamically load KML after that,
 * but for shipping default maps, this is the place to define them.
 */

var layers = [
  new OpenLayers.Layer.TMS('World',
      'tiles/',
      {
        layername: 'world-dark',
        wrapDateLine: true,
        type: 'png'
      }
  )

/*
 * Sample KML file: uncomment and edit to add a new KML file
 * which will exist on the map for every pageload
 *
 ,new OpenLayers.Layer.GML( 'Polling Centers', 'polling_centers.kml', 
  {
    format:OpenLayers.Format.KML, 
    projection: new OpenLayers.Projection('EPSG:4326'),
    isBaseLayer: false,
    formatOptions:{}
    }
  )
  */
]
