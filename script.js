	var koordinate = location.search;
	var Suche1 = koordinate.indexOf(",");
	var Suche2 = koordinate.indexOf("z=");
	var lat = parseFloat(koordinate.substr(1, Suche1 - 1));
	var lon = parseFloat(koordinate.substr(Suche1 + 1, Suche2 - Suche1 - 2));
	var zoom = koordinate.substr(Suche2 + 2, 2) * 1;
	if(zoom > 14){zoom=12}
	var map;
	function display_map() {
		usermap.load();
			map.addControl(new OpenLayers.Control.LayerSwitcher({'dataLayersDiv':false
			}));
			layerSwitcher = map.getControlsByClass("OpenLayers.Control.LayerSwitcher")[0];
			layer_markers = new OpenLayers.Layer.Markers("Marker", {
				projection: new OpenLayers.Projection("EPSG:4326"),
				visibility: true,
				displayInLayerSwitcher: false
				});
		var osm_mapnik = new OpenLayers.Layer.OSM.Mapnik("OSM Macknick");
		map.addLayers([layer_markers, osm_mapnik]);
		var google_terrain = new OpenLayers.Layer.Google("Google Terrain", {type: google.maps.MapTypeId.TERRAIN, numZoomLevels: 20});
		var google_roadmap = new OpenLayers.Layer.Google("Google Strassen", {type: google.maps.MapTypeId.ROADMAP, numZoomLevels: 20});
		var google_hybrid = new OpenLayers.Layer.Google("Google Hybrid", {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20});
		var google_satellite = new OpenLayers.Layer.Google("Google Satellit", {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 20});
		map.addLayers([google_satellite, google_roadmap, google_terrain, google_hybrid]);
	
		var bing_road = new OpenLayers.Layer.Bing({name: "Bing! Strassen", key: 'AhJTBOYRgqRfqNjtWm4bwekoq-UxuQ6h4b9-aMyglGbUDmoJv4JwzRXppqf17axz', type: "Road"});
		var bing_hybrid = new OpenLayers.Layer.Bing({name: "Bing! Hybrid", key: 'AhJTBOYRgqRfqNjtWm4bwekoq-UxuQ6h4b9-aMyglGbUDmoJv4JwzRXppqf17axz', type: "AerialWithLabels"});
		var bing_aerial = new OpenLayers.Layer.Bing({name: "Bing! Satellit", key: 'AhJTBOYRgqRfqNjtWm4bwekoq-UxuQ6h4b9-aMyglGbUDmoJv4JwzRXppqf17axz', type: "Aerial"});
		
		map.setBaseLayer(google_satellite);
		map.addLayers([bing_aerial, bing_road, bing_hybrid]);
		map.setBaseLayer(osm_mapnik);
		
		usermap.jumpTo(parseFloat(lon),parseFloat(lat), zoom);
		$('#loading').hide();
	}
	function reload_marker(Alon, Alat, Blon, Blat) {
		layer_markers.clearMarkers();
		var marker = usermap.generateMarker('marker.png');
		usermap.addMarker(layer_markers, parseFloat(lon),parseFloat(lat), marker);
	}
	$('document').ready(display_map);
var usermap = {};
var click, map, layer_markers;
var s_touch = false;
(function($) {
var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
usermap.load = function() {
	map = new OpenLayers.Map('map',{projection: 'EPSG:3857'});
	map.events.register("moveend",map,function(e){usermap.reload();});
};
usermap.reload = function() {
	var tlLonLat = map.getLonLatFromPixel(new OpenLayers.Pixel(1,1));
	var pos0= new OpenLayers.LonLat(tlLonLat.lon,tlLonLat.lat).transform(toProjection,fromProjection);
	var mapsize = map.getSize();
	var brLonLat = map.getLonLatFromPixel(new OpenLayers.Pixel(mapsize.w - 1, mapsize.h - 1));
	var pos1= new OpenLayers.LonLat(brLonLat.lon,brLonLat.lat).transform(toProjection,fromProjection);
	reload_marker(pos0.lon, pos0.lat, pos1.lon, pos1.lat);
};
usermap.jumpTo=function(lon, lat, zoom) {
	var x = usermap.Lon2Merc(lon);
	var y = usermap.Lat2Merc(lat);
	map.setCenter(new OpenLayers.LonLat(x, y), zoom);
	return false;
};
usermap.Lon2Merc=function(lon) {
	return 20037508.34 * lon / 180;
};
usermap.Lat2Merc=function(lat) {
	var PI = 3.14159265358979323846;
	lat = Math.log(Math.tan( (90 + lat) * PI / 360)) / (PI / 180);
	return 20037508.34 * lat / 180;
};
usermap.generateMarker=function(image){
	var size = new OpenLayers.Size(26,26);
	var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
	var i = new OpenLayers.Icon(image, size, offset);
	return i;
};
usermap.addMarker=function(layer, lon, lat, marker) {
	var ll = new OpenLayers.LonLat(usermap.Lon2Merc(lon), usermap.Lat2Merc(lat));
	var feature = new OpenLayers.Feature(layer, ll);
	feature.closeBox = true;
	feature.popupClass = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {minSize: new OpenLayers.Size(100, 10) } );
	/*feature.data.popupContentHTML = popupContentHTML;*/
	feature.data.overflow = "hidden";
	var marker = new OpenLayers.Marker(ll, marker);
	marker.feature = feature;
	var markerClick = function(evt) {
		if (this.popup == null) {
			this.popup = this.createPopup(this.closeBox);
			map.addPopup(this.popup);
			this.popup.show();
		} else {
			this.popup.toggle();
		}
		OpenLayers.Event.stop(evt);
	};
	marker.events.register("mousedown", feature, markerClick);
	marker.events.register("touchstart", feature, markerClick);
	layer.addMarker(marker);
};
})(jQuery);
