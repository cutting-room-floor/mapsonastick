/**
 * Basic KML constructor. Only necessary to correctly
 * set projections
 * @param layer_title Any alphanumeric layer title
 * @param layer_url URL to the KML feed
 * @return none
 */
function add_kml(layer_title, layer_url, extract_styles) {
    if(extract_styles) {
      format_options = {
        extractStyles: true, 
        extractAttributes: true,
        maxDepth: 2
      };
    }
    else {
      format_options = new Array();
    }

    l = new OpenLayers.Layer.GML(layer_title, layer_url, 
    {
      format: OpenLayers.Format.KML, 
      projection: new OpenLayers.Projection("EPSG:4326"),
      formatOptions: format_options
    })
    map.addLayer(l);
}

var baselayers = new Array();
var myswitcher;

/**
 * TODO: This needs to be rewritten.
 * Specialized object serializer for OpenLayers layer objects
 * @param hash javascript dictionary/hash object
 * @return javascript string that nearly initializes that object
 */
function hash_to_string(hash) {
   out = "";
   for(n in hash) {
     if(typeof(hash[n].prototype) != 'undefined') {
       // this is for formats, mostly OpenLayers.Format.KML
       out  += n+":"+hash[n].prototype.CLASS_NAME+",\n";
     }
     else if(hash[n].CLASS_NAME == 'OpenLayers.Projection') {
       // make a constructor for projections
       out += n+": new "+hash[n].CLASS_NAME+"('"+hash[n].projCode+"'),";
     }
     else if(typeof hash[n] == "object") {
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
  var all_layers = this[0].layers.slice(); // not certain of why .slice is called
  var layers = new Array();
  $.each(all_layers, function() {
    if(this.isBaseLayer == false) {
      layers.push(this);
    }
  });
  return $({'layers':layers});
}


/**
 * jQuery function that runs after .get_layers and returns a javascript
 * layer intialization string
 * @return javascript object initialization string
 */
$.fn.serialize_layers = function(options) {
  serialized_layers = "var layers = ["+this[0].layers.map(layer_serialize).join(",\n")+"]";
  return serialized_layers;
}

/**
 * layer_serialize: A wrapper that writes valid javascript for layer objects
 * @param layer an OpenLayers layer object
 * @return javascript string definition of that layer
 */
function layer_serialize(layer) {
  // If the layer has a styleMap, and it's one of the defaults, do this.
  if((typeof layer.styleMap.name != 'undefined')
      && (typeof default_styles[layer.styleMap.name] != 'undefined')) {
    console.log(default_styles);
    layer.options['styleMap'] = "default_styles['"+layer.styleMap.name+"']";
  }
  return "new "+layer.CLASS_NAME+"( \
'"+layer.name+"', \
'"+layer.url+"', \
{"+hash_to_string(layer.options)+"})";
}



/**
 * Get a tile from OpenStreetMap.
 * This code reused, will probably be killed soon
 */
function osm_getTileURL(bounds) {
    var res = this.map.getResolution();
    var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
    var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
    var z = this.map.getZoom();
    var limit = Math.pow(2, z);

    if (y < 0 || y >= limit) {
        return OpenLayers.Util.getImagesLocation() + "404.png";
    } else {
        x = ((x % limit) + limit) % limit;
        return this.url + z + "/" + x + "/" + y + "." + this.type;
    }
}

var map = null;

OpenLayers.ImgPath = 'images/openlayers/';
$(document).ready(
  function() {
    /**
     * set options so that KML markers with lat/lon points can
     * be placed on map tiles that are in spherical mercator
     */
    var options = {
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: "m",
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34,
                                         20037508.34, 20037508.34)
    };
  
    map = new OpenLayers.Map('map', options);

    var mapnik = new OpenLayers.Layer.TMS(
        "OpenStreetMap (Mapnik)",
        "http://tile.openstreetmap.org/",
        {
            type: 'png',getURL: osm_getTileURL,
            displayOutsideMaxExtent: true,
            maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
            attribution: '<a href="http://www.openstreetmap.org/">OpenStreetMap</a>',
            
        }
    );

    afghanistan_winter = new OpenLayers.Layer.TMS(
      "Afghanistan Roads",
      "",
      {
          type: 'png',
          layername: 'roads',
          /*displayOutsideMaxExtent: true,
          maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34), */
          attribution: '<a href="http://www.mapbox.org/">MapBox</a>',
      }
    )

    map.addLayers([mapnik, afghanistan_winter]);

    function onPopupClose(evt) {
        selectControl.unselect(selectedFeature);
    }
    function onFeatureSelect(feature) {
        selectedFeature = feature;
        console.log(feature);
        popup = new OpenLayers.Popup.FramedCloud2("stick", 
          feature.geometry.getBounds().getCenterLonLat(),
          null,
          "<div style='font-size:.8em'>Feature: " + feature.id +"<br />Area: " + feature.geometry.getArea()+"</div>",
          null, true, onPopupClose);
        feature.popup = popup;
        map.addPopup(popup);
    }
    function onFeatureUnselect(feature) {
        map.removePopup(feature.popup);
        feature.popup.destroy();
        feature.popup = null;
    }    

    /**
     * add layers defined in layers.js if they are available
     */
    if(typeof layers != "undefined") {
      map.addLayers(layers);
      selectControl = new OpenLayers.Control.SelectFeature(layers,
        {onSelect: onFeatureSelect, onUnselect: onFeatureUnselect});
    }

    map.addControl(selectControl);
    selectControl.activate();
    
    console.log('hi');
    console.log(OpenLayersPlusBlockswitcher);
    map.zoomToMaxExtent();
    OpenLayersPlusBlockswitcher._attach($('#layer_switcher'), map);
  }
);

$(document).ready(
  function() {
    $("#add_layer").click(function() {
      type = $("#layer_type").val();
      name = $("#layer_name").val();
      extract = $("#extract").val() == "on";
      url = $("#layer_url").val();
      add_kml(name, url, extract);
    });
    $("#save_layer").click(function() {
      layer_data = $(map).get_layers().serialize_layers();
      $("#save_filename").click();
      basepath = document.location.href.substring(0, document.location.href.lastIndexOf('/') + 1);
      filepath = basepath+'layers.js'; 
      filepath = $.twFile.convertUriToLocalPath(filepath); 
      $.twFile.save(filepath, layer_data);
    });
    $("#file_trigger").click(function() {
      $("#layer_filename").click();
    });
    $("#layer_filename").change(function() {
      $("#layer_url").val($(this).val());
    });


  }
);
