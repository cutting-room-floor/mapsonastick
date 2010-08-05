/*jslint white: false */
/*jslint forin: true */
/*global OpenLayers $ default_styles document jQuery window OpenLayersPlusBlockswitcher */

/**
 * Blockswitcher is **NOT** an OpenLayers control.
 */
OpenLayersPlusBlockswitcher = {};
OpenLayersPlusBlockswitcher.layerStates = [];

/**
 * Initializes the blockswitcher and attaches to DOM elements.
 */
OpenLayersPlusBlockswitcher.hattach = function(element, map) {
  this.map = map;
  this.blockswitcher = element;

  map.events.on({
    "addlayer": this.redraw,
    "changelayer": this.redraw,
    "removelayer": this.redraw,
    "changebaselayer": this.redraw,
    scope: this
  });
  this.redraw();
};

/**
 * Initializes the blockswitcher and attaches to DOM elements.
 */
OpenLayersPlusBlockswitcher.attach = function(context) {
  var data = $(context).data('openlayers');
  if (data && data.map.behaviors.openlayers_plus_behavior_blockswitcher) {
    this.map = data.openlayers;

    // If behavior has requested display inside of map, respect it.
    if (data.map.behaviors.openlayers_plus_behavior_blockswitcher.map.enabled === true) {
      var block = $(data.map.behaviors.openlayers_plus_behavior_blockswitcher.block);
      block.addClass(data.map.behaviors.openlayers_plus_behavior_blockswitcher.map.position);
      $('h2.block-title', block).click(function() {
        $(this).parents('div.block').toggleClass('expanded');
        $(this).siblings('div.block-content').toggle();
      });
      $(context).append(block);
    }
    this.blockswitcher = $('div.openlayers-blockswitcher');

    data.openlayers.events.on({
      "addlayer": this.redraw,
      "changelayer": this.redraw,
      "removelayer": this.redraw,
      "changebaselayer": this.redraw,
      scope: this
    });
  }
};

/**
 * Checks if the layer state has changed since the last redraw() call.
 *
 * Returns:
 * {Boolean} The layer state changed since the last redraw() call.
 */
OpenLayersPlusBlockswitcher.needsRedraw = function() {
  if ( !this.layerStates.length || (this.map.layers.length != this.layerStates.length) ) {
    return true;
  }
  for (var i=0, len=this.layerStates.length; i<len; i++) {
    var layerState = this.layerStates[i];
    var layer = this.map.layers[i];
    if ( (layerState.name !== layer.name) || (layerState.inRange !== layer.inRange) || (layerState.id !== layer.id) || (layerState.visibility !== layer.visibility) ) {
      return true;
    }
  }
  if (this.styleChanged === true) {
    this.styleChanged = false;
    return true;
  }
  return false;
};

/**
 * Redraws the blockswitcher to reflect the current state of layers.
 */
OpenLayersPlusBlockswitcher.redraw = function() {
  var css, len, layers;
  if (this.needsRedraw()) {
    // Clear out previous layers
    $('.layers.base .layers-content div', this.blockswitcher).remove();
    $('.layers.data .layers-content div', this.blockswitcher).remove();
    $('.layers.base', this.blockswitcher).hide();
    $('.layers.data', this.blockswitcher).hide();

    // Save state -- for checking layer if the map state changed.
    // We save this before redrawing, because in the process of redrawing
    // we will trigger more visibility changes, and we want to not redraw
    // and enter an infinite loop.
    len = this.map.layers.length;
    this.layerStates = new Array(len);
    for (var i = 0; i < len; i++) {
      var layerState = this.map.layers[i];
      this.layerStates[i] = {
        'name': layerState.name,
        'visibility': layerState.visibility, 
        'inRange': layerState.inRange, 
        'id': layerState.id
      };
    }

    layers = this.map.layers.slice();
    for (i = 0, len = layers.length; i < len; i++) {
      var layer = layers[i];
      var baseLayer = layer.isBaseLayer;
      if (layer.displayInLayerSwitcher) {
        // Only check a baselayer if it is *the* baselayer, check data layers if they are visible
        var checked = baseLayer ? (layer === this.map.baseLayer) : layer.getVisibility();

        // Create input element
        var inputType = (baseLayer) ? "radio" : "checkbox";
        var inputElem = $('.factory .'+ inputType, this.blockswitcher).clone();
        var layerTools = $('.factory .layer-tools').clone();

        // Append to container
        var container = baseLayer ? $('.layers.base', this.blockswitcher) : $('.layers.data', this.blockswitcher);
        container.show();
        $('.layers-content', container).append(inputElem);
        $(inputElem).prepend(layerTools);

        // Set label text
        $('label', inputElem).append((layer.title !== undefined) ? layer.title : layer.name);

        $('a.layer-zoom', inputElem).click(
          function() { return OpenLayersPlusBlockswitcher.layerZoom(this); })
          .data('layer', layer);

        // Add states and click handler
        if (baseLayer) {
          $(inputElem)
            .click(function() { OpenLayersPlusBlockswitcher.layerClick(this); })
            .data('layer', layer);
          if (checked) {
            $(inputElem).addClass('activated');
          }
        }
        else {
          $('input', inputElem)
            .click(function() { OpenLayersPlusBlockswitcher.layerClick(this); })
            .data('layer', layer)
            .attr('disabled', !baseLayer && !layer.inRange)
            .attr('checked', checked);
          // Set key styles
          if (layer.styleMap) {
            css = this.styleMapToCSS(layer.styleMap);
            $('span.key', inputElem).css(css)
              .data('layer', layer)
              .click(this.selectStyle);
          }
        }
      }
    }
  }
};

OpenLayersPlusBlockswitcher.selectStyle = function(element) {
  var k,j,y;
  y = false;
  current_style = $(this).data('layer').styleMap.name;

  default_styles_keys = [];

  // basically array_keys, there may be a js saying
  for (k in default_styles) {
    default_styles_keys.push(k);
  }
  current_index = default_styles_keys.indexOf(current_style);

  $(this).data('layer').styleMap = 
    default_styles[default_styles_keys[
      (current_index + 1) % (default_styles_keys.length)]];

  $(this).data('layer').redraw();
  OpenLayersPlusBlockswitcher.styleChanged = true;
  OpenLayersPlusBlockswitcher.redraw();
  return false; // prevent layerClick from triggering
};

OpenLayersPlusBlockswitcher.layerZoom = function(element) {
  var layer = $(element).data('layer');
  if (layer.options.ext !== null) {
    layer.map.zoomToExtent(layer.options.ext);
    layer.map.zoomIn();
  }
  else if (!layer.isBaseLayer) {
    if (layer.features.length == 1) {
      layer.map.zoomToExtent(layer.getDataExtent());
      layer.map.zoomTo(10); // TODO: zoom to max provided by baselayer
    }
    else {
      layer.map.zoomToExtent(layer.getDataExtent());
    }
  }
  return false;
}



/**
 * Click handler that activates or deactivates a layer.
 */
OpenLayersPlusBlockswitcher.layerClick = function(element) {
  var layer = $(element).data('layer');
  if (layer.isBaseLayer) {
    $('.layers.base .layers-content .activated').removeClass('activated');
    $(element).addClass('activated');
    layer.map.setBaseLayer(layer);
    if (layer.options.ext !== null) {
      layer.map.zoomToExtent(layer.options.ext);
      layer.map.zoomIn();
    }
  }
  else {
    layer.setVisibility($(element).is(':checked'));
  }
};

/**
  * Parameters:
  * styleMap {OpenLayers.StyleMap}
  *
  * Returns:
  * {Object} An object with css properties and values that can be applied to an element
  *
  */
OpenLayersPlusBlockswitcher.styleMapToCSS = function (styleMap) {
  css = {};
  default_style = styleMap.styles['default'].defaultStyle;
  if (default_style.fillColor === 'transparent' && typeof default_style.externalGraphic !== 'undefined') {
    css['background-image'] = 'url('+default_style.externalGraphic+')';
    css['background-repeat'] = 'no-repeat';
    css['background-color'] = 'transparent';
    css.width = default_style.pointRadius * 2;
    css.height = default_style.pointRadius * 2;
  }
  else {
    css['background-color'] = default_style.fillColor;
  }
  if (default_style.strokeWidth > 0) {
    css['border-color'] = default_style.strokeColor;
  }
  return css;
};
