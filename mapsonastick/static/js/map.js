/*jslint white: false */
/*jslint forin: true */
/*global OpenLayers $ default_styles document jQuery window OpenLayersPlusBlockswitcher layers */

/**
 * Maps on a Stick 
 *
 * This file contains all of the custom javascript logic 
 * for Maps on a Stick.
 *
 * @author Tom MacWright
 * @version 1.0
 */

var map, baselayers, myswitcher, selectedFeature, styleindex;
var styleindex = 0;
baselayers = [];

OpenLayers.ImgPath = '/static/images/openlayers/';

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
        if(this.features.length > 0) {
          this.map.zoomToExtent(this.getDataExtent());
        }
        else {
          alert('This KML layer could not be loaded.' + 
          'Check that it has been added to the KML Data folder.');
          this.map.removeLayer(this);
        }
      },
      'context': this
  });
  map.addLayer(l);
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

function load_layers() {
  var layer_list;
  $.getJSON('/layers', function(resp) {
    for(var i = 0; i < resp.length; i++) {
      map.addLayer(
        new OpenLayers.Layer.TMS(resp[i][1], '/tiles/',
        {
          layername: resp[i][0],
          type: 'png'
        }
      ));
      map.zoomToMaxExtent();
      map.zoomTo(2);
    }
  });
}

$(document).ready(
  function() {
    /**
     * @TODO: these should be moved outside this function
     */
    var options, mapnik, selectControl;
        /**
         * set options so that KML markers with lat/lon points can
         * be placed on map tiles that are in spherical mercator
         */
    options = {
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: "m",
        maxResolution: 156543.0339,
        // theme: 'system/images/openlayers/style.css',
        controls: [
          new OpenLayers.Control.PanZoomBar(),
          new OpenLayers.Control.Attribution(),
          new OpenLayers.Control.Navigation()
          ],
        maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34,
          20037508.34, 20037508.34)
    };

    map = new OpenLayers.Map('map', options);

    load_layers();
    /**
     * add layers defined in layers.js if they are available
     */
    selectControl = new OpenLayers.Control.SelectFeature([],
        {onSelect: onFeatureSelect, onUnselect: onFeatureUnselect});

    map.addControl(selectControl);
    selectControl.activate();
    OpenLayersPlusBlockswitcher.hattach($('.openlayers-blockswitcher'), map);
  }
);

$(document).ready(
  function() {
    $('#kml-file-chooser').toggle(
      function() {
        $('#kml_window').css({'display': 'block'});
      },
      function() {
        $('#kml_window').css({'display': 'none'});
      }
    );
    $('#kml-file-input-cancel').click(
      function() {
        $('#kml-file-chooser').click();
      }
    );
    $('#kml-file-input').change(function() {
      $('#kml-file-submit').attr({'disabled': false});
    });
    $('#kml-file-submit').click(function() {
      var name, url;
      url = $("#kml-file-input").val();
      url = "KML Data/" + basename(url);
      name = basename(url, '.kml');
      add_kml(name, url);
      attachSelect();
      $('#kml-file-submit').attr({'disabled': true});
      $('#kml-file-chooser').click();
    });
  }
);
