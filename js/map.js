function addKML(layer_title, layer_url) {
    l = new OpenLayers.Layer.GML(layer_title, layer_url, 
    {
      format: OpenLayers.Format.KML, 
      formatOptions: {
        extractStyles: true, 
        extractAttributes: true,
        maxDepth: 2
      }
    })
    map.addLayer(l);
}

function addTMS(layer_title, layer_url, layer_name, type) {
    l = new OpenLayers.Layer.TMS(
        layer_title,
        layer_url,
        {
            'layername': layer_name,
            'type': type,
        }
    );
    map.addLayer(l);
}


var baselayers = new Array();

/**
 * TODO: This needs to be rewritten.
 */
function hash_to_string(hash) {
   out = "";
   for(n in hash) {
     if(hash[n].prototype) {
       out  += n+":"+hash[n].prototype.CLASS_NAME+",\n";
     }
     else if(typeof hash[n] == "object") {
       out += hash_to_string(hash[n]);
     }
     else {
       out  += n+":"+hash[n]+",\n";
     }
   }
   return out;
}

function layer_serialize(layer) {
  return "new "+layer.CLASS_NAME+"( \
'"+layer.name+"', \
'"+layer.url+"', \
{"+hash_to_string(layer.options)+"})";
}

$.fn.getLayers = function(options) {
  var all_layers = this[0].layers.slice(); // not certain of why .slice is called
  var layers = new Array();
  $.each(all_layers, function() {
    layers.push(this);
  });
  return $({'layers':layers});
}

$.fn.serializeLayers = function(options) {
  serialized_layers = "var layers = ["+this[0].layers.map(layer_serialize).join(",\n")+"]";
  return serialized_layers;
}

var map = null;

$(document).ready(
  function() {
    map = new OpenLayers.Map('map');
    var ol_wms = new OpenLayers.Layer.WMS(
        "OpenLayers WMS",
        "http://labs.metacarta.com/wms/vmap0",
        {layers: 'basic'}
    );
    map.addLayers([ol_wms]);
    map.addLayers(layers);
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToMaxExtent();
  }
);

$(document).ready(
  function() {
  $("#add_layer").click(function() {
    type = $("#layer_type").val();
    name = $("#layer_name").val();
    url = $("#layer_url").val();
    if(type == "KML") {
      addKML(name, url);
    }
  });
  $("#save_layer").click(function() {
    layer_data = $(map).getLayers().serializeLayers();
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
});
