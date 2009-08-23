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
)};

for(style in default_styles) {
  default_styles[style].name = style;
}
