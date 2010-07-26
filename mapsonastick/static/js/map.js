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
 * @version 2.0
 */

var map, baselayers, myswitcher, selectedFeature, styleindex;
var styleindex = 0;
baselayers = [];

OpenLayers.ImgPath = '/static/images/openlayers/';
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
OpenLayers.ProxyHost = '/proxy?url=';

function onPopupClose(evt) {
  map.getControlsByClass('OpenLayers.Control.SelectFeature')[0].unselect(selectedFeature);
}

function attributes_to_table(attributes) {
  var key, out;
  out = "";
  for (key in attributes) {
    if (typeof attributes[key] === 'string') {
      out += "<tr><td colspan=2>" + 
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
      "<div style='font-size:.8em'>" + attributes_to_table(feature.attributes) + "</div>",
      null, true, onPopupClose);
  feature.popup = popup;
  map.addPopup(popup);
}

function onFeatureUnselect(feature) {
  map.removePopup(feature.popup);
  feature.popup.destroy();
  feature.popup = null;
}

function attachSelect(l) {
  var layer, layers, selecter;
  if (arguments.length < 1) {
    layers = [];
    for (layer in map.layers) {
      if (map.layers[layer].CLASS_NAME === 'OpenLayers.Layer.Vector') {
        layers.push(map.layers[layer]);
      }
    }
  }
  else {
    layers = [l];
  }
  map.removeControl(
    map.getControlsByClass('OpenLayers.Control.SelectFeature')[0]);
  selecter = new OpenLayers.Control.SelectFeature(layers,
        {onSelect: onFeatureSelect, onUnselect: onFeatureUnselect});
  map.addControl(selecter);
  selecter.activate();
}

/**
 * Basic KML constructor. Only necessary to correctly
 * set projections
 * @param layer_title Any alphanumeric layer title
 * @param layer_url URL to the KML feed
 * @return none
 */
function add_kml(layer_title, layer_url, layer_filename) {
  var l, kml_title,
      args = OpenLayers.Util.getParameters();
  l = new OpenLayers.Layer.Vector(
    layer_title,
    {
      projection:'EPSG:4326',
      strategies:[new OpenLayers.Strategy.Fixed()],
      protocol:new OpenLayers.Protocol.HTTP({
        url:layer_url,
        format:new OpenLayers.Format.KML({
          extractStyles: true, 
          extractAttributes: true,
          keepData: true,
          maxDepth: 2
        })
      }),
      visibility: false
    }
  );
  if (layer_filename !== null && args.added_file === layer_filename) {
    l.setVisibility(true);
  }
  l.events.on({
      'loadend': function() {
        if (this.features.length > 0) {
          kml_title = $(this.protocol.format.data).find('kml > Document > name').text();
          if (kml_title) {
            this.title = kml_title;
            OpenLayersPlusBlockswitcher.styleChanged = true;
            OpenLayersPlusBlockswitcher.redraw();
          }
          if (this.features.length == 1) {
            this.map.zoomToExtent(this.getDataExtent());
            this.map.zoomTo(10); // TODO: zoom to max provided by baselayer
          }
          else {
            this.map.zoomToExtent(this.getDataExtent());
          }
        }
        else {
          this.map.removeLayer(this);
        }
      },
      'context': this
  });
  map.addLayer(l);
  attachSelect(l);
}


function load_layers() {
  $.getJSON('/layers', function(resp) {
    var last = {};
    for(var i = 0; i < resp.layers.length; i++) {
      var b = OpenLayers.Bounds.fromArray(resp.layers[i][2]);
      var x = b.transform(
        new OpenLayers.Projection('EPSG:4326'),
        new OpenLayers.Projection('EPSG:900913'));
      last = new OpenLayers.Layer.TMS(resp.layers[i][1], '/tiles/',
        {
          layername: resp.layers[i][0],
          type: 'png',
          ext: x
        }
      );
      map.addLayer(last);
    }
    map.setBaseLayer(last);
    map.zoomToExtent(last.options.ext);
    map.zoomIn();
    for(var j = 0; j < resp.overlays.length; j++) {
      add_kml(resp.overlays[j], "/kml?url=" + resp.overlays[j], resp.overlays[j]);
    }
  });
}

$(document).ready(
  function() {
    /**
     * @TODO: these should be moved outside this function
     */
    var options, selectControl;
        /**
         * set options so that KML markers with lat/lon points can
         * be placed on map tiles that are in spherical mercator
         */
    options = {
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: "m",
        maxResolution: 156543.0339,
        theme: 'static/images/openlayers/style.css',
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

    $(function(){ $("input[type='file']").uniform({fileBtnText: 'Upload KML'});});
    $('#kml-url-add').toggle(
      function() {
        $('#kml_window').css({'display': 'block'});
      },
      function() {
        $('#kml_window').css({'display': 'none'});
      }
    );
    $('#kml-file-button').click(function() {
      $('#kml-file-input').click();
    });
    $('#kml-url-input-cancel').click(
      function() {
        $('#kml-url-add').click();
      }
    );
    $('#kml-file-input').change(
      function() {
        $('#kml-file-form').submit();
      }
    );
    $('#kml-url-submit').click(function() {
      var name, url;
      url = $("#kml-url").val();
      add_kml(name, url);
      $('#kml-file-submit').attr({'disabled': true});
      $('#kml-url-add').click();
    });
  }
);
