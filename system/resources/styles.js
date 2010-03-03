/**
 * Maps on a Stick style definitions
 *
 * clicking the legend-color (the box to the left of layer names)
 * will cycle through styles for vector layers.
 */

var default_styles = {
  'green': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          fillColor: "#93ce54", 
          fillOpacity: 1, 
          strokeColor: "#4c8014",
          pointRadius: 4
        },
        OpenLayers.Feature.Vector.style["default"]
      )
    ),
  'yellow': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          fillColor: "#ffae00", 
          fillOpacity: 1, 
          strokeColor: "#8d6000",
          pointRadius: 4
        },
        OpenLayers.Feature.Vector.style["default"]
      )
    ),
  'black': new OpenLayers.StyleMap(
    OpenLayers.Util.applyDefaults(
        {
          fillColor: "black", 
          fillOpacity: 0.6, 
          strokeColor: "white",
          pointRadius: 4
        },
        OpenLayers.Feature.Vector.style["default"]
      )
    ),
};

for(style in default_styles) {
  default_styles[style].name = style;
}
