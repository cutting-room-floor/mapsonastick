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

var map, selectedFeature;

OpenLayers.ImgPath = '/static/images/openlayers/';
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
OpenLayers.ProxyHost = '/proxy?url=';

// message wrapper, replaceable by TileMill components
function moas_message(title, message, type) {
  alert(message);
}

function moas_confirm(title, message, type) {
  return confirm(message);
}

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


function attributes_to_table(attributes) {
  var key, out;
  out = '';
  for (key in attributes) {
    if (typeof attributes[key] === 'string') {
      out += '<tr><td colspan=2>' + 
        attributes[key] + '</td></tr>';
    }
    else {
      out += '<tr><th>' + 
        attributes[key].displayName + 
        '</th><td>' + 
        attributes[key].value + '</td></tr>';
    }
  }
  return '<table>' + out + '</table>';
}

function onFeatureSelect(feature) {
  var popup;
  selectedFeature = feature;
  popup = new OpenLayers.Popup.FramedCloud('stick', 
      feature.geometry.getBounds().getCenterLonLat(),
      null,
      "<div style='font-size:.8em'>" + attributes_to_table(feature.attributes) + "</div>",
      null, true, 
      // on popup close
      function(evt) { 
        map.getControlsByClass('OpenLayers.Control.SelectFeature')[0].unselect(selectedFeature);
      }
    );
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
  l.setVisibility(layer_filename !== null && args.added_file === layer_filename);
  l.events.on({
      'loadend': function() {
        if (this.features.length > 0) {
          if (this.features.length > 900 && // 900 is an arbitary number
            !moas_confirm('', 'This KML file (' + layer_filename + ') contains over ' +
            'nine hundred points. It may cause your browser to operate slowly. Are you ' +
            'sure you want to load this layer?')) {
              this.map.removeLayer(this);
          }
          try {
            var kml_title = $(this.protocol.format.data).find('kml > Document > name').text();
            if (kml_title !== "") {
              this.title = kml_title;
              OpenLayersPlusBlockswitcher.styleChanged = true;
              OpenLayersPlusBlockswitcher.redraw();
            }
          } catch(err) { }
          if (this.features.length == 1) {
            this.map.zoomToExtent(this.getDataExtent());
            this.map.zoomTo(10); // TODO: zoom to max provided by baselayer
          }
          else {
            this.map.zoomToExtent(this.getDataExtent());
          }
        }
        else {
          moas_message('', 'This KML file (' + layer_filename + 
            ') could not be loaded. It may be empty or corrupted. If this' +
            ' error persists, you may want to remove the file from the KML folder.');
          this.map.removeLayer(this);
        }
        attachSelect(this);
      },
      'context': this
  });
  map.addLayer(l);
  attachSelect(l);
}


/**
 * Basic KML constructor. Only necessary to correctly
 * set projections
 * @param layer_title Any alphanumeric layer title
 * @param layer_url URL to the KML feed
 * @return none
 */
function add_rss(layer_title, layer_url, layer_filename) {
  var l, kml_title,
      args = OpenLayers.Util.getParameters();
  l = new OpenLayers.Layer.GeoRSS(layer_title, layer_url);
  l.setVisibility(layer_filename !== null && args.added_file === layer_filename);
  l.events.on({
      'loadend': function() {
        if (this.features.length > 0) {
          if (this.features.length > 900 && // 900 is an arbitary number
            !moas_confirm('', 'This KML file (' + layer_filename + ') contains over ' +
            'nine hundred points. It may cause your browser to operate slowly. Are you ' +
            'sure you want to load this layer?')) {
              this.map.removeLayer(this);
          }
          try {
            var kml_title = $(this.protocol.format.data).find('kml > Document > name').text();
            if (kml_title !== "") {
              this.title = kml_title;
              OpenLayersPlusBlockswitcher.styleChanged = true;
              OpenLayersPlusBlockswitcher.redraw();
            }
          } catch(err) { }
          if (this.features.length == 1) {
            this.map.zoomToExtent(this.getDataExtent());
            this.map.zoomTo(10); // TODO: zoom to max provided by baselayer
          }
          else {
            this.map.zoomToExtent(this.getDataExtent());
          }
        }
        else {
          moas_message('', 'This KML file (' + layer_filename + 
            ') could not be loaded. It may be empty or corrupted. If this' +
            ' error persists, you may want to remove the file from the KML folder.');
          this.map.removeLayer(this);
        }
        attachSelect(this);
      },
      'context': this
  });
  map.addLayer(l);
  attachSelect(l);
}

function resolution_range(start, end) {
  var res = [156543.0339,
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
    0.5971642833709717];
  return (arguments.length === 0) ? res : res.slice(start, end + 1);
}

function load_layers() {
  $.getJSON('/layers', function(resp) {
    if (resp.layers.length === 0) {
      moas_message('', 'You currently have no layers loaded in Maps on a Stick. ' +
        'You can add layers by dropping .mbtiles files into the Maps/ folder of your installation');
      return;
    }
    for(var i = 0; i < resp.layers.length; i++) {
      var b = OpenLayers.Bounds.fromArray(resp.layers[i].bounds);
      var x = b.transform(
        new OpenLayers.Projection('EPSG:4326'),
        new OpenLayers.Projection('EPSG:900913'));
      map.addLayer(new OpenLayers.Layer.TMS((resp.layers[i].name || resp.layers[i].filename), '/tiles/',
        {
          layername: resp.layers[i].path,
          type: 'png',
          ext: x,
          visibility: false,
          serverResolutions: resolution_range(),
          isBaseLayer: ((resp.layers[i].type || 'baselayer') == 'baselayer'),
          resolutions: resolution_range(
            resp.layers[i].zooms[0], 
            resp.layers[i].zooms[1])
        }
      ));
    }
    map.setBaseLayer(map.getLayersBy('isBaseLayer', true)[0]);
    map.zoomToExtent(map.getLayersBy('isBaseLayer', true)[0].options.ext);
    map.zoomIn();
    for(var j = 0; j < resp.overlays.length; j++) {
      add_kml(resp.overlays[j].file, resp.overlays[j].path, resp.overlays[j].file);
      /**
       * TODO: readd RSS
      if(resp.overlays[j].search(".rss") !== -1) {
        add_rss(resp.overlays[j], "/kml?url=" + resp.overlays[j], resp.overlays[j]);
      }
      */
    }
  });
}

$(window).load(
  function() {
    /**
     * @TODO: these should be moved outside this function
     */
    var selectControl;

    map = new OpenLayers.Map('map', {
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
    });

    load_layers();
    
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
