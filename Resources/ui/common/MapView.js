var mySize = (Titanium.Platform.displayCaps.platformHeight * 15) / 100;
var createMap = function(_vehicle) {
	var _map = Ti.Map.createView({
		mapType : (Ti.Platform.osname === 'iphone') ? Ti.Map.HYBRID_TYPE : Ti.Map.SATELLITE_TYPE,
		animation : true,
		regionFit : true,
		userLocation : true
	});
	Titanium.Geolocation.getCurrentPosition(function(e) {
		if (e.error) {
			Ti.API.info(L("code_translation") + translateErrorCode(e.code));
			alert(L("error") + JSON.stringify(e.error));
			return;
		}
		var region = {
			latitude : (e.coords.latitude + _vehicle.waypoint.latitude) / 2,
			longitude : (e.coords.longitude + _vehicle.waypoint.longitude) / 2,
			latitudeDelta : Math.abs(((e.coords.latitude + _vehicle.waypoint.latitude) / 2) - _vehicle.waypoint.latitude) * 10,
			longitudeDelta : Math.abs(((e.coords.longitude + _vehicle.waypoint.longitude) / 2) - _vehicle.waypoint.longitude) * 10
		};
		_map.setLocation(region);
	});

	return _map;
};
exports.createMap = createMap;

var createVehiclePin = function(_vehicle) {
	var timestamp = new Date(_vehicle.waypoint.timestamp);
	var pin = Ti.Map.createAnnotation({
		latitude : _vehicle.waypoint.latitude,
		longitude : _vehicle.waypoint.longitude,
		title : _vehicle.title,
		subtitle : L('located') + moment(_vehicle.waypoint.timestamp).fromNow(),
		pincolor : Ti.Map.ANNOTATION_RED,
		animate : true,
		leftView : Ti.UI.createImageView({image:(vehicleDataValidity(_vehicle.waypoint.timestamp)),height : mySize,
		width : mySize})
	});

	return pin;
};
exports.createVehiclePin = createVehiclePin;

var resetPin_Map = function(_map, _vehicle) {
	var timestamp = new Date(_vehicle.waypoint.timestamp);
	Titanium.Geolocation.getCurrentPosition(function(e) {
		if (e.error) {
			Ti.API.info(L("code_translation") + translateErrorCode(e.code));
			alert(L('error') + JSON.stringify(e.error));
			return;
		}
		var region = {
			latitude : (e.coords.latitude + _vehicle.waypoint.latitude) / 2,
			longitude : (e.coords.longitude + _vehicle.waypoint.longitude) / 2,
			animate : true,
			latitudeDelta : Math.abs(((e.coords.latitude + _vehicle.waypoint.latitude) / 2) - _vehicle.waypoint.latitude) * 10,
			longitudeDelta : Math.abs(((e.coords.longitude + _vehicle.waypoint.longitude) / 2) - _vehicle.waypoint.longitude) * 10
		};
		_map.setLocation(region);
	});
	_map.setAnnotations([Ti.Map.createAnnotation({
		latitude : _vehicle.waypoint.latitude,
		longitude : _vehicle.waypoint.longitude,
		title : _vehicle.title,
		subtitle : L('located') + moment(_vehicle.waypoint.timestamp).fromNow(),
		pincolor : Ti.Map.ANNOTATION_RED,
		animate : true,
		leftView : (Ti.UI.createImageView({image:(vehicleDataValidity(_vehicle.waypoint.timestamp)),height : mySize,
		width : mySize}))
	})]);
};
exports.resetPin_Map = resetPin_Map;

var resetRegion = function(_map, _vehicle) {
	Titanium.Geolocation.getCurrentPosition(function(e) {
		if (e.error) {
			Ti.API.info(L('code_translation') + translateErrorCode(e.code));
			alert(L('error') + JSON.stringify(e.error));
			return;
		}
		var region = {
			latitude : (e.coords.latitude + _vehicle.waypoint.latitude) / 2,
			longitude : (e.coords.longitude + _vehicle.waypoint.longitude) / 2,
			animate : true,
			latitudeDelta : Math.abs(((e.coords.latitude + _vehicle.waypoint.latitude) / 2) - _vehicle.waypoint.latitude) * 10,
			longitudeDelta : Math.abs(((e.coords.longitude + _vehicle.waypoint.longitude) / 2) - _vehicle.waypoint.longitude) * 10
		};
		_map.setLocation(region);
	});
};
exports.resetRegion = resetRegion;

function vehicleDataValidity(_date) {
	var currentDate = moment();
	var dataStatus;
	if (currentDate.diff(moment(_date), 'hours', true) <= 1.0)
		dataStatus = 'green';
	else if (currentDate.diff(moment(_date), 'days', true) <= 1.0)
		dataStatus = 'yellow';
	else
		dataStatus = 'red';
	var statusImage = Ti.UI.createImageView({
		image : '/images/status-' + dataStatus + '.png',
		height : mySize,
		width : mySize
	});
	return statusImage.toBlob();
}

var translateErrorCode = function(code) {
	if (code == null) {
		return null;
	}
	switch (code) {
		case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
			return L('location_unknown');
		case Ti.Geolocation.ERROR_DENIED:
			return L('access_denied');
		case Ti.Geolocation.ERROR_NETWORK:
			return L('network_error');
		case Ti.Geolocation.ERROR_HEADING_FAILURE:
			return L('heading_failure');
		case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
			return L('region_mon_acc_denied');
		case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
			return L('region_mon_acc_failure');
		case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
			return L('region_mon_setup_delay');
	}
};
exports.translateErrorCode = translateErrorCode;
