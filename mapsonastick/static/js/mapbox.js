OpenLayers.Layer.MapBox = OpenLayers.Class(OpenLayers.Layer.TMS, {
    /*
     * Do not remove the MapBox or OpenLayers attribution from this code,
     * doing so is in violation of the terms of both licenses.
     */
    initialize: function (name, options) {
        var newArguments, // Arguments which will be automatically
                          // sent to the Layer.TMS constructor
            urls; // Multiple server URLs with the same contents 
                  // but distributed for performance
        mapbox_logo = "<a class='mapbox-branding' href='http://mapbox.com'></a> | <a href='http://mapbox.com/tos'>Terms of Service</a>";
        options = OpenLayers.Util.extend({
//          moved just outside the map
//             attribution: mapbox_logo,
            transitionEffect: 'resize',
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
            maxResolution: 156543.0339,
            minResolution: 0.5971642833709717,
            units: "m",
            type: "png",
            projection: "EPSG:900913",
            isBaseLayer: true,
            numZoomLevels: 19,
            displayOutsideMaxExtent: true,
            wrapDateLine: true,
            buffer: 0
        }, options);
        urls = [
            "http://a.tile.mapbox.com/",
            "http://b.tile.mapbox.com/",
            "http://c.tile.mapbox.com/",
            "http://c.tile.mapbox.com/"
        ];
        newArguments = [name, urls, options];
        OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
    },
    CLASS_NAME: "OpenLayers.Layer.MapBox"
});

OpenLayers.Layer.lMapBox = OpenLayers.Class(OpenLayers.Layer.TMS, {
    /*
     * Do not remove the MapBox or OpenLayers attribution from this code,
     * doing so is in violation of the terms of both licenses.
     */
    initialize: function (name, url, options) {
        var newArguments, // Arguments which will be automatically
                          // sent to the Layer.TMS constructor
            urls; // Multiple server URLs with the same contents 
                  // but distributed for performance
        mapbox_logo = "<a class='mapbox-branding' href='http://mapbox.com'></a> | <a href='http://mapbox.com/tos'>Terms of Service</a>";
        options = OpenLayers.Util.extend({
//          moved just outside the map
//             attribution: mapbox_logo,
            transitionEffect: 'resize',
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
            maxResolution: 156543.0339,
            minResolution: 0.5971642833709717,
            units: "m",
            type: "png",
            projection: "EPSG:900913",
            isBaseLayer: true,
            numZoomLevels: 19,
            displayOutsideMaxExtent: true,
            wrapDateLine: true
        }, options);
        newArguments = [name, url, options];
        OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
    },
    CLASS_NAME: "OpenLayers.Layer.MapBox"
});
