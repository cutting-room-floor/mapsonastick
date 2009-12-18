/*
 * mapsona layer definitions
 *
 * Layers defined here will appear on the map on
 * initial pageloads: you can dynamically load KML after that,
 * but for shipping default maps, this is the place to define them.
 */

/**
 * IMPORTANT NOTE:
 *
 * between layer definitions in the array below, there must be commas,
 * but after the last layer definition, there should not be a comma.
 *
 * For example, it could look like
 *
 * new OpenLayers.Layer.TMS('World',
 *    .... LAYER DEFINITION
 * ),
 * new OpenLayers.Layer.TMS('Mars',
 *    .... LAYER DEFINITION
 * )
 *
 * Note the comma after the World definition and the lack of comma
 * after Mars. Incorrectly placing commas will break the site in
 * various web browsers
 */

var layers = [
/*
 * To those interested in adding a new offline tileset,
 * duplicate the chunk of code below and rename 
 * 'World' and 'world-dark' to whatever you want your
 * layer to be called in the legend and what the 
 * tileset directory is called, respectively.
 */
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
