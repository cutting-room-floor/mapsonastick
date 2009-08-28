var default_styles = {
  'green': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          fillColor: "green", 
          fillOpacity: 0.6, 
          strokeColor: "green"
        },
        OpenLayers.Feature.Vector.style["default"]
      )
    ),
  'yellow': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          fillColor: "yellow", 
          fillOpacity: 0.6, 
          strokeColor: "yellow"
        },
        OpenLayers.Feature.Vector.style["default"]
      )
    ),
  'black': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          fillColor: "black", 
          fillOpacity: 0.6, 
          strokeColor: "black"
        },
        OpenLayers.Feature.Vector.style["default"]
      )
    ),
  'airports': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          externalGraphic: 'icons/airport.png',
          fillColor: "transparent", 
          fillOpacity: 1, 
          pointRadius: 8,
          strokeColor: "transparent"
        },
        OpenLayers.Feature.Vector.style["default"]
      )
    ),
  'military': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          externalGraphic: 'icons/military.png',
          fillColor: "transparent", 
          fillOpacity: 1, 
          pointRadius: 8,
          strokeColor: "transparent"
        },
        OpenLayers.Feature.Vector.style["default"]
      )
    ),
   'school': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          externalGraphic: 'icons/school.png',
          fillColor: "transparent", 
          fillOpacity: 1, 
          pointRadius: 8,
          strokeColor: "transparent"
        },
        OpenLayers.Feature.Vector.style["default"]
      )
    ),
   'medical': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          externalGraphic: 'icons/medical.png',
          fillColor: "transparent", 
          fillOpacity: 1, 
          pointRadius: 8,
          strokeColor: "transparent"
        },
        OpenLayers.Feature.Vector.style["default"]
      )
    ),
  
};

for(style in default_styles) {
  default_styles[style].name = style;
}
