/*jslint white: false */
/*jslint forin: true */
/*global OpenLayers $ default_styles document jQuery window OpenLayersPlusBlockswitcher layers */

/**
 * Mapsona 
 *
 * This file contains all of the custom javascript logic 
 * for mapsona.
 *
 * @author Tom MacWright
 * @version 1.0
 */

var map, baselayers, myswitcher, selectedFeature, styleindex;
var styleindex = 0;
baselayers = [];

OpenLayers.ImgPath = 'system/images/openlayers/';

function onPopupClose(evt) {
  map.getControlsByClass('OpenLayers.Control.SelectFeature')[0].unselect(selectedFeature);
}

function new_style(dict) {
  var k, i;
  styleindex++;
  i = 0;
  for (k in dict) {
    if (i === styleindex) {
      return dict[k];
    }
    i++;
  }
}

function attributes_to_table(attributes) {
  var key, out;
  out = "";
  for (key in attributes) {
    if (typeof attributes[key] === 'string') {
      out += "<tr><th>" + 
        "Name" +
        "</th><td>" + 
        attributes[key] + "</td></tr>";
    }
    else {
      out += "<tr><th>" + 
        attributes[key].displayName + 
        "</th><td>" + 
        attributes[key].value + "</td></tr>";
    }
  }
  return "<table>" + out + "</table>";
}


function onFeatureSelect(feature) {
  var popup;
  selectedFeature = feature;
  popup = new OpenLayers.Popup.FramedCloud("stick", 
      feature.geometry.getBounds().getCenterLonLat(),
      null,
      "<div style='font-size:.8em'><h3>" + attributes_to_table(feature.attributes) + "</h3></div>",
      null, true, onPopupClose);
  feature.popup = popup;
  map.addPopup(popup);
}

function onFeatureUnselect(feature) {
  map.removePopup(feature.popup);
  feature.popup.destroy();
  feature.popup = null;
}    

/*
 * From php.js
 */
function basename (path, suffix) {
  var b = path.replace(/^.*[\/\\]/g, '');
      if (typeof(suffix) === 'string' && b.substr(b.length-suffix.length) === suffix) {
      b = b.substr(0, b.length-suffix.length);
  }
  return b;
}


/**
 * Basic KML constructor. Only necessary to correctly
 * set projections
 * @param layer_title Any alphanumeric layer title
 * @param layer_url URL to the KML feed
 * @return none
 */
function add_kml(layer_title, layer_url) {
  var format_options, l;
  format_options = {
    extractStyles: true, 
    extractAttributes: true,
    maxDepth: 2
  };
  l = new OpenLayers.Layer.GML(layer_title, layer_url, 
  {
    format: OpenLayers.Format.KML, 
    projection: new OpenLayers.Projection("EPSG:4326"),
    formatOptions: format_options,
    styleMap: new_style(default_styles)
  });
  l.events.on({
      'loadend': function() {
        this.map.zoomToExtent(this.getDataExtent());
      },
      'context': this
  });
  map.addLayer(l);
}
/**
 * TODO: This needs to be rewritten.
 * Specialized object serializer for OpenLayers layer objects
 * @param hash javascript dictionary/hash object
 * @return javascript string that nearly initializes that object
 */
function hash_to_string(hash) {
  var out, n;
  out = "";
  for(n in hash) {
    if(typeof(hash[n].prototype) !== 'undefined') {
      // this is for formats, mostly OpenLayers.Format.KML
      out  += n+":"+hash[n].prototype.CLASS_NAME+",\n";
    }
    else if(hash[n].CLASS_NAME === 'OpenLayers.Projection') {
      // make a constructor for projections
      out += n+": new "+hash[n].CLASS_NAME+"('"+hash[n].projCode+"'),";
    }
    else if(typeof hash[n] === "object") {
      // basically the options array
      out += n+":{"+hash_to_string(hash[n])+"},";
    }
    else {
      // plain properties
      out  += n+":"+hash[n]+",\n";
    }
  }
  return out;
}


/**
 * jQuery function which gets layers out of an OpenLayers map object
 * @param options optional options dictionary
 * @return jquery object with property layers: layer array
 */
$.fn.get_layers = function(options) {
  var all_layers, layers;
  all_layers = this[0].layers.slice(); // not certain of why .slice is called
  layers = [];
  $.each(all_layers, function() {
      if(this.isBaseLayer === false) {
      layers.push(this);
      }
      });
  return $({'layers':layers});
};

/**
 * layer_serialize: A wrapper that writes valid javascript for layer objects
 * @param layer an OpenLayers layer object
 * @return javascript string definition of that layer
 */
function layer_serialize(layer) {
  // If the layer has a styleMap, and it's one of the defaults, do this.
  if((typeof layer.styleMap.name !== 'undefined') &&
      (typeof default_styles[layer.styleMap.name] !== 'undefined')) {
    layer.options.styleMap = "default_styles['"+layer.styleMap.name+"']";
  }
  return "new "+layer.CLASS_NAME+"( '"+
    layer.name+"', '"+
    layer.url+"', {"+hash_to_string(layer.options)+"})";
}

/**
 * jQuery function that runs after .get_layers and returns a javascript
 * layer intialization string
 * @return javascript object initialization string
 */
$.fn.serialize_layers = function(options) {
  var serialized_layers = "var layers = ["+this[0].layers.map(layer_serialize).join(",\n")+"]";
  return serialized_layers;
};

/**
 * Get a tile from OpenStreetMap.
 * This code reused, will probably be killed soon
 */
function osm_getTileURL(bounds) {
  var res, x, y, z, limit;
  res = this.map.getResolution();
  x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
  y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
  z = this.map.getZoom();
  limit = Math.pow(2, z);

  if (y < 0 || y >= limit) {
    return OpenLayers.Util.getImagesLocation() + "404.png";
  } else {
    x = ((x % limit) + limit) % limit;
    return this.url + z + "/" + x + "/" + y + "." + this.type;
  }
}

function attachSelect() {
  var layer, layers, selecter;
  layers = [];
  for (layer in map.layers) {
    if (map.layers[layer].CLASS_NAME === 'OpenLayers.Layer.GML') {
      layers.push(map.layers[layer]);
    }
  }
  map.removeControl(
    map.getControlsByClass('OpenLayers.Control.SelectFeature')[0]);
  selecter = new OpenLayers.Control.SelectFeature(layers,
        {onSelect: onFeatureSelect, onUnselect: onFeatureUnselect});
  map.addControl(selecter);
  selecter.activate();
}

$(document).ready(
  function() {
    /**
     * @TODO: these should be moved outside this function
     */
    var options, mapnik, afghanistan_winter, selectControl;
        /**
         * set options so that KML markers with lat/lon points can
         * be placed on map tiles that are in spherical mercator
         */
        options = {
    projection: new OpenLayers.Projection("EPSG:900913"),
    displayProjection: new OpenLayers.Projection("EPSG:4326"),
    units: "m",
    maxResolution: 156543.0339,
    controls: [
      new OpenLayers.Control.PanZoomBar(),
      new OpenLayers.Control.Attribution(),
      new OpenLayers.Control.Navigation()
      ],
    maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34,
      20037508.34, 20037508.34)
    };

    map = new OpenLayers.Map('map', options);

    map.addLayers(layers);
    /**
     * add layers defined in layers.js if they are available
     */
    selectControl = new OpenLayers.Control.SelectFeature([],
        {onSelect: onFeatureSelect, onUnselect: onFeatureUnselect});

    map.addControl(selectControl);
    selectControl.activate();
    map.zoomToMaxExtent();
    OpenLayersPlusBlockswitcher.hattach($('.openlayers-blockswitcher'), map);
  }
);

$(document).ready(
  function() {
  $('#kml-file-submit').click(function() {
    var name, url;
    url = $("#kml-file-input").val();
    url = "kml/" + basename(url);
    name = basename(url, '.kml');
    add_kml(name, url);
    attachSelect();
  });
  $("#save_layer").click(function() {
    var layer_data, basepath, filepath;
    layer_data = $(map).get_layers().serialize_layers();
    $("#save_filename").click();
    basepath = document.location.href.substring(0, document.location.href.lastIndexOf('/') + 1);
    filepath = basepath+'layers.js'; 
    filepath = $.twFile.convertUriToLocalPath(filepath); 
    $.twFile.save(filepath, layer_data);
    });
  }
);
