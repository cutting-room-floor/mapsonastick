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
  new OpenLayers.Layer.lMapBox('World',
      'tiles/',
      {
        layername: 'world-light',
        wrapDateLine: true,
        type: 'png',
        serverResolutions: [
              156543.0339,
              78271.51695,
              39135.758475,
              19567.8792375,
              9783.93961875,
              4891.969809375,
              2445.9849046875,
              1222.99245234375,
              611.496226171875,
              305.7481130859375,
              152.87405654296876,
              76.43702827148438,
              38.21851413574219,
              19.109257067871095,
              9.554628533935547,
              4.777314266967774,
              2.388657133483887,
              1.1943285667419434,
              0.5971642833709717],
        resolutions: [
              39135.758475,
              19567.8792375,
              9783.93961875,
              4891.969809375,
              2445.9849046875,
              1222.99245234375,
              611.496226171875,
              305.7481130859375
              ]
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
