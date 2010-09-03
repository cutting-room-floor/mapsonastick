OpenLayers.ImgPath = '/static/images/openlayers/';
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
OpenLayers.ProxyHost = '/proxy?url=';

OpenLayers.Feature.Vector.style['default'] = {
    fillColor: '#B40500',
    fillOpacity: 0.7, 
    hoverFillColor: 'white',
    hoverFillOpacity: 0.8,
    strokeColor: '#B40500',
    strokeOpacity: 0.2,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeDashstyle: 'solid',
    hoverStrokeColor: 'red',
    hoverStrokeOpacity: 1,
    hoverStrokeWidth: 0.2,
    pointRadius: 6,
    hoverPointRadius: 1,
    hoverPointUnit: '%',
    pointerEvents: 'visiblePainted',
    cursor: 'inherit'
};

OpenLayers.Feature.Vector.style.select = {
    fillColor: '#B40500',
    fillOpacity: 1, 
    hoverFillColor: 'white',
    hoverFillOpacity: 0.8,
    strokeColor: '#000000',
    strokeOpacity: 1,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeDashstyle: 'solid',
    hoverStrokeColor: 'red',
    hoverStrokeOpacity: 1,
    hoverStrokeWidth: 0.2,
    pointRadius: 6,
    hoverPointRadius: 1,
    hoverPointUnit: '%',
    pointerEvents: 'visiblePainted',
    cursor: 'pointer'
};

/**
 * mapsona style definitions
 *
 * clicking the legend-color (the box to the left of layer names)
 * will cycle through styles for vector layers.
 */
var default_styles = {
  'green': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          fillColor: '#93ce54', 
          fillOpacity: 1, 
          strokeColor: '#4c8014',
          pointRadius: 4,
          externalGraphic:'/images/default_marker.png'
        },
        OpenLayers.Feature.Vector.style['default']
      )
    ),
  'yellow': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          fillColor: '#ffae00', 
          fillOpacity: 1, 
          strokeColor: '#8d6000',
          pointRadius: 4,
          externalGraphic:'/images/default_marker.png'
        },
        OpenLayers.Feature.Vector.style['default']
      )
    ),
  'black': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          fillColor: 'black', 
          fillOpacity: 0.6, 
          strokeColor: 'white',
          pointRadius: 4,
          externalGraphic:'/images/default_marker.png'
        },
        OpenLayers.Feature.Vector.style['default']
      )
    ),
};

for(style in default_styles) {
  default_styles[style].name = style;
}
