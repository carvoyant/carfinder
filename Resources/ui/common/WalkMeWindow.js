var DISTANCE_FILTER_VAL = 3;
var HEADING_FILTER_VAL = 15;
Ti.Geolocation.distanceFilter = DISTANCE_FILTER_VAL;
Ti.Geolocation.headingFilter = HEADING_FILTER_VAL;

var WalkMeWindow = function(_vehicle) {
	var win = Ti.UI.createWindow({
		title : L("walking_to") + _vehicle.title,
		navBarHidden : true
	});

	var uiSize = (Titanium.Platform.displayCaps.platformHeight * 25) / 100;

	if (Titanium.Geolocation.locationServicesEnabled === false) {
		Titanium.UI.createAlertDialog({
			title : L('app_name'),
			message : L('gps_off')
		}).show();
		win.close();
	} else {
		if (Titanium.Platform.name != 'android') {
			var authorization = Titanium.Geolocation.locationServicesAuthorization;
			Ti.API.info('Authorization: ' + authorization);
			if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
				Ti.UI.createAlertDialog({
					title : L('app_name'),
					message : L('geo_disallowed')
				}).show();
				win.close();
			} else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
				Ti.UI.createAlertDialog({
					title : L('app_name'),
					message : L('geo_disallowed')
				}).show();
				win.close();
			}
		}
		var distanceLabel = Ti.UI.createLabel({
			color : '#FFF',
			backgroundColor : 'black',
			font : {
				fontSize : 24
			},
			textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
			top : 0,
			width : Ti.UI.SIZE,
			height : Ti.UI.SIZE
		});

		// var headingLabel = Ti.UI.createLabel({
		// color : '#FFF',
		// backgroundColor : 'black',
		// font : {
		// fontSize : 24
		// },
		// textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
		// bottom : 0,
		// width : Ti.UI.SIZE,
		// height : Ti.UI.SIZE
		// });

		var Map = require('ui/common/MapView');
		var mapView = Map.createMap(_vehicle);
		mapView.setAnnotations([Map.createVehiclePin(_vehicle)]);

		win.add(_map);
		win.add(distanceLabel);
		//win.add(headingLabel);

		var deviceCompass = false;
		if (Titanium.Geolocation.hasCompass) {
			deviceCompass = true;
			var signImg = Ti.UI.createImageView({
				image : '/images/yellow-sign.png',
				height : uiSize,
				width : uiSize,
				center : {
					x : Titanium.Platform.displayCaps.platformWidth - ((uiSize / 2) + 5),
					y : uiSize / 2 + 10
				},
			});
			var arrowImg = Titanium.UI.createImageView({
				image : '/images/arrow.png',
				backgroundColor : 'transparent',
				anchorPoint : {
					x : 0.5,
					y : 0.5
				},
				center : signImg.getCenter(),
				height : uiSize / 2,
				width : uiSize / 2
			});

			// Spin the image
			var matrix2d = Ti.UI.create2DMatrix();
			var a = Ti.UI.createAnimation();
			win.add(signImg);
			win.add(arrowImg);
		} else {
			deviceCompass = false;
			Titanium.API.info(L("no_compass"));
			Ti.UI.createAlertDialog({
				title : L('app_name'),
				message : L('no_compass_detailed'),
				buttonNames : [L('okay')]
			}).show();

		}

		var userCoords;
		var previousDistance, previousHeading;

		function locationCallback(e) {
			distanceLabel.setText(distance(e.coords.latitude, e.coords.longitude, _vehicle.waypoint.latitude, _vehicle.waypoint.longitude));
			Map.resetRegion(_map, _vehicle);
			//mapView.setUserLocation(true);
			Ti.API.info(L('distance')+": " + distance(e.coords.latitude, e.coords.longitude, _vehicle.waypoint.latitude, _vehicle.waypoint.longitude));
			userCoords = e.coords;
			Ti.API.info(L('user_location') + ": " + userCoords.latitude + ", " + userCoords.longitude);
		}

		function headingCallback(e) {
			if (deviceCompass) {
				if (userCoords != null) {
					a.transform = matrix2d.rotate(bearing(userCoords.latitude, userCoords.longitude, _vehicle.waypoint.latitude, _vehicle.waypoint.longitude) - +e.heading.trueHeading);
					//headingLabel.setText("bearing: " + bearing(userCoords.latitude, userCoords.longitude, _vehicle.waypoint.latitude, _vehicle.waypoint.longitude)+", heading: "+e.heading.trueHeading);
					//a.transform = matrix2d.rotate(e.heading.trueHeading);
					arrowImg.animate(a);
					Ti.API.info(L('bearing') + ": " + bearing(_vehicle.waypoint.latitude, _vehicle.waypoint.longitude, userCoords.latitude, userCoords.longitude));
					Ti.API.info(L('heading') + ": " + e.heading.trueHeading);
				}
			}
		}


		Titanium.Geolocation.addEventListener('location', function(e) {
			if (e.error) {
				Ti.API.info(L('code_translation') + ": "  + Map.translateErrorCode(e.code));
				alert(L('error') + JSON.stringify(e.error));
				return;
			}
		});

		win.addEventListener('focus', function() {
			Ti.API.info("adding location callback on resume");
			Titanium.Geolocation.addEventListener('location', function(e) {
				locationCallback(e, _vehicle);
			});
			Titanium.Geolocation.addEventListener('heading', function(e) {
				headingCallback(e, _vehicle);
			});
			_map.setUserLocation(true);
		});
		win.addEventListener('blur', function() {
			Ti.API.info("pause event received");
			Ti.API.info("removing location callback on pause");
			Titanium.Geolocation.removeEventListener('location', function(e) {
				locationCallback(e, _vehicle);
			});
			Titanium.Geolocation.removeEventListener('heading', function(e) {
				headingCallback(e, _vehicle);
			});
		});

		if (Ti.Platform.osname === 'iphone') {
			// Create a Button.
			var Close = Ti.UI.createButton({
				title : 'Close',
				bottom : 5,
				left : 5,
				style : Ti.UI.iPhone.SystemButtonStyle.DONE
			});
			// Listen for click events.
			Close.addEventListener('click', function() {
				win.close({
					animated : true
				});
			});
			// Add to the parent view.
			win.add(Close);
		}
	}

	if (Ti.Platform.osname === 'android') {
		win.addEventListener('close', function(e) {
			Ti.App.fireEvent('returningToMainView');
		});
	}

	return win;
};

Number.prototype.toRad = function() {
	return this * Math.PI / 180;
};

function distance(lat1, lon1, lat2, lon2) {
	var unitSystem = Ti.App.Properties.getString("unitSystem");
	var unit;
	if (unitSystem == "Metric")
		var R = 6371;
	// km
	else if (unitSystem == "Imperial")
		var R = 3959;
	// miles
	var dLat = (lat2 - lat1).toRad();
	var dLon = (lon2 - lon1).toRad();
	var lat1 = lat1.toRad();
	var lat2 = lat2.toRad();

	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var dist = R * c;

	if (unitSystem == "Metric") {
		unit = "km";
		if (dist < 1) {
			dist = dist * 1000;
			unit = "m";
		}
	}// km
	else if (unitSystem == "Imperial") {
		unit = "mi";
		if (dist < 1) {
			dist = dist * 1760;
			unit = "yd";
			if (dist < 30) {
				dist = dist * 3;
				unit = "ft";
			}
		}
	}
	;// miles

	Ti.API.info("distance: " + dist + " " + unit);

	return String(dist.toFixed(2) + " " + unit);
}

function bearing(lat1, lon1, lat2, lon2) {
	var y = Math.sin(lon2 - lon1) * Math.cos(lat2);
	var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
	var brng = -1 * (Math.atan2(y, x) * 180 / Math.PI);

	if (brng < 0)
		brng = brng + 360;

	return brng;
}

module.exports = WalkMeWindow;
