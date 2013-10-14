//Application Window Component Constructor
function ApplicationWindow() {
	var win = Ti.UI.createWindow({
		backgroundColor : '#fff',
		exitOnClose : true,
		navBarHidden : true
	});
	win.openedflag = 0;
	win.focusedflag = 0;

	win.activity.onPrepareOptionsMenu = function(e){
		var SettingWin = require('ui/common/SettingsWindow');
		var settings = new SettingWin(win.containingTab);
		settings.open();
	
	};
    var uiSize = (Titanium.Platform.displayCaps.platformHeight) / 6;

	var vehicleData = Ti.App.Properties.getList("vehicleData");
	var selectedVehicle = Ti.App.Properties.getObject("defaultVehicle");
	var navigationMode = false;

	var Map = require('ui/common/MapView');
	var mapView = Map.createMap(selectedVehicle);
	mapView.setAnnotations([Map.createVehiclePin(selectedVehicle)]);
	// mapView.setUserLocation(false);

	win.add(mapView);

	var selectVehicleButton = Titanium.UI.createButton({
		title : selectedVehicle.title,
		width: Titanium.Platform.displayCaps.platformWidth - 20,
		top : 10,
		height :"auto"
	});
	selectVehicleButton.addEventListener('click', function() {
		Ti.API.info("timestamp: " + selectedVehicle.waypoint.timestamp.toLocaleString());
		var options = [];
		var selectedVehicleIndex;
		for (var i = 0; i < vehicleData.length; i++) {
			options.push(vehicleData[i].title);
			if (selectedVehicle.title === vehicleData[i].title)
				selectedVehicleIndex = i;
		}
		var opts = {
			options : options,
			buttonNames : [L('cancel')],
			selectedIndex : selectedVehicleIndex,
			title : L('select_vehicle')
		};

		var dialog = Ti.UI.createOptionDialog(opts);
		dialog.addEventListener('click', function(_e) {
			if (!_e.button) {
				mapView.removeAllAnnotations();
				//win.add(vehicleDataValidity(selectedVehicle.waypoint.timestamp))
				selectedVehicle = vehicleData[_e.index];
				Ti.App.Properties.setObject("defaultVehicle", selectedVehicle);
				Map.resetPin_Map(mapView, selectedVehicle);
				selectVehicleButton.setTitle(selectedVehicle.title);
				Ti.API.info("Index: " + _e.index);
			}
		});
		dialog.show();
	});
	var gearImage = Ti.UI.createImageView({
		image : '/images/gear.png'
	});
	var gearBlob = gearImage.toBlob();
	Ti.API.info(gearBlob);

	var settingsButton = Titanium.UI.createButton({
		image : gearBlob,
		left : 0,
		height : selectVehicleButton.getHeight(),
		width : selectVehicleButton.getHeight(),
		bottom : 0
	});
	settingsButton.addEventListener('click', function() {
		var SettingWin = require('ui/common/SettingsWindow');
		var settings = new SettingWin(win.containingTab);
		settings.open();
		//settings.open({modal:true});
	});
	win.add(settingsButton);

	win.add(selectVehicleButton);

	var navButton = Titanium.UI.createButton({
		image : '/images/arrowhead_left.png',
		right : 0,
		height : selectVehicleButton.getHeight(),
		width : selectVehicleButton.getHeight(),
		bottom : 0
	});
	
	var signImg;

	var arrowImg;
	
	var distanceLabel;
	
	var a = Ti.UI.createAnimation();
	var deviceCompass = false;
	var matrix2d = Ti.UI.create2DMatrix();
	
	function locationCallback(e) {
		if (e.error) {
			Ti.API.info("Code translation: " + Map.translateErrorCode(e.code));
			alert('error ' + JSON.stringify(e.error));
			return;
		} else {
			distanceLabel.setText(distance(e.coords.latitude, e.coords.longitude, selectedVehicle.waypoint.latitude, selectedVehicle.waypoint.longitude));
			//Map.resetRegion(_map, selectedVehicle);
			//mapView.setUserLocation(true);
			//Ti.API.info(L('distance') + distance(e.coords.latitude, e.coords.longitude, selectedVehicle.waypoint.latitude, selectedVehicle.waypoint.longitude));
			userCoords = e.coords;
			//Ti.API.info(L('user_location') + userCoords.latitude + ", " + userCoords.longitude);
		}
	}

	function headingCallback(e) {
		if (deviceCompass) {
			if (userCoords != null) {
				a.transform = matrix2d.rotate(bearing(userCoords.latitude, userCoords.longitude, selectedVehicle.waypoint.latitude, selectedVehicle.waypoint.longitude) - +e.heading.trueHeading);
				//headingLabel.setText("bearing: " + bearing(userCoords.latitude, userCoords.longitude, selectedVehicle.waypoint.latitude, selectedVehicle.waypoint.longitude)+", heading: "+e.heading.trueHeading);
				//a.transform = matrix2d.rotate(e.heading.trueHeading);
				arrowImg.animate(a);
				//Ti.API.info("bearing: " + bearing(selectedVehicle.waypoint.latitude, selectedVehicle.waypoint.longitude, userCoords.latitude, userCoords.longitude));
				//Ti.API.info("heading: " + e.heading.trueHeading);
			}
		}
	}
	
	function exitNavigationMode(e) {
		navButton.setImage('/images/arrowhead_left.png');

		//e.cancelBubble = true;
		win.remove(distanceLabel);
		Ti.API.info("exit navigation received");
		win.remove(signImg);
		win.remove(arrowImg);
		Ti.API.info("removing location callback");
		Titanium.Geolocation.removeEventListener('location', locationCallback);
		Titanium.Geolocation.removeEventListener('heading', headingCallback);
		navigationMode = false;
		win.removeEventListener('androidback', exitNavigationMode);
	}
	
	function layoutComplete(e) {
		arrowImg.setTop(signImg.rect.y + signImg.rect.height/4);
		arrowImg.setRight(Titanium.Platform.displayCaps.platformWidth - signImg.rect.x - signImg.rect.width/2 - arrowImg.rect.width/2);
		distanceLabel.setTop(signImg.rect.y + signImg.rect.height+5);
		distanceLabel.setRight(signImg.getRight());
		win.add(arrowImg);
		win.add(distanceLabel);
		win.removeEventListener('postlayout', layoutComplete);
	}
	
	navButton.addEventListener('click', function() {

		if(navigationMode)
		{
			exitNavigationMode(null);
		}
		else
		{
			var dialog = Titanium.UI.createAlertDialog({
				title : L('directions'),
				message : L('walk_to_car'),
				buttonNames : [L('yes'), L('no_i_will_drive'), L('cancel')],
				cancel : 2
			});
			dialog.addEventListener('click', function(_e) {
				if (_e.index == 1) {
					Ti.Geolocation.getCurrentPosition(function(e) {
						if (e.error) {
							Ti.API.info("Code translation: " + translateErrorCode(e.code));
							alert('error ' + JSON.stringify(e.error));
							return;
						} else {
							Ti.Platform.openURL('http://maps.google.com/maps?t=m&saddr=' + e.coords.latitude + "," + e.coords.longitude + '&daddr=' + selectedVehicle.waypoint.latitude + "," + selectedVehicle.waypoint.longitude);
						}
					});
				} 
				else if (_e.index == 0) {
					if (Titanium.Geolocation.locationServicesEnabled === false) {
						Titanium.UI.createAlertDialog({
							title : L('app_name'),
							message : 'Your device has geo turned off - turn it on.'
						}).show();
					} 
					else {
						if (Titanium.Platform.name != 'android') {
							if (win.openedflag == 0) {
								Ti.API.info('firing open event');
								win.fireEvent('open');
							}
							if (win.focusedflag == 0) {
								Ti.API.info('firing focus event');
								win.fireEvent('focus');
							}
							var authorization = Titanium.Geolocation.locationServicesAuthorization;
							Ti.API.info('Authorization: ' + authorization);
							if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
								Ti.UI.createAlertDialog({
									title : L('app_name'),
									message : 'You have disallowed us from running geolocation services.'
								}).show();
							} else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
								Ti.UI.createAlertDialog({
									title : L('app_name'),
									message : 'Your system has disallowed us from running geolocation services.'
								}).show();
							}
						}
	
						navigationMode = true;
	

			
						if (Titanium.Geolocation.hasCompass) {
							deviceCompass = true;
		
							navButton.setImage('/images/nav_pressed.png');

							
							signImg = Ti.UI.createImageView({
								image : '/images/yellow-sign.png',
								height : uiSize,
								width : uiSize,
								top : selectVehicleButton.size.height + 10,
								right : 10,
								opacity : 0.95							});
							
							arrowImg = Titanium.UI.createImageView({
								image : '/images/arrow.png',
								backgroundColor : 'transparent',
								anchorPoint : {
									x : 0.5,
									y : 0.5
								},
								height : uiSize / 2,
								width : uiSize / 2
							});
							
							distanceLabel = Ti.UI.createLabel({
								backgroundImage : '/images/distance_sign.png',
								font : {
									fontSize : 20
								},
								color : 'black',
								textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
								width : uiSize,
								height : 40,
								opacity : 0.95
							});
							
							win.add(signImg);
							win.add(arrowImg);
							arrowImg.hide();
	
							var userCoords;
							var previousDistance, previousHeading;
		
		
		
		
							Titanium.Geolocation.addEventListener('location', locationCallback);
							Titanium.Geolocation.addEventListener('heading', headingCallback);
							
							win.addEventListener('postlayout', layoutComplete);

							win.addEventListener('focus', function() {
								win.focusedflag = 1;
								if (navigationMode == true) {
									Ti.API.info("focus event received");
									Ti.API.info("adding location callback on focus");
									Titanium.Geolocation.addEventListener('location', locationCallback);
									Titanium.Geolocation.addEventListener('heading', headingCallback);
								}
							});
							win.addEventListener('blur', function() {
								win.focusedflag = 0;
								Ti.API.info("blur event received");
								Ti.API.info("removing location callback on pause");
								Titanium.Geolocation.removeEventListener('location', locationCallback);
								Titanium.Geolocation.removeEventListener('heading', headingCallback);
							});
							Ti.Android.currentActivity.addEventListener('resume', function() {
								if (navigationMode == true) {
									Ti.API.info("resume event received");
									Ti.API.info("adding location callback on resume");
									Titanium.Geolocation.addEventListener('location', locationCallback);
									Titanium.Geolocation.addEventListener('heading', headingCallback);
								}
							});
							Ti.Android.currentActivity.addEventListener('pause', function() {
								Ti.API.info("pause event received");
								Ti.API.info("removing location callback on close");
								Titanium.Geolocation.removeEventListener('location', locationCallback);
								Titanium.Geolocation.removeEventListener('heading', headingCallback);
							});
							Ti.Android.currentActivity.addEventListener('stop', function() {
								Ti.API.info("stop event received");
								Ti.API.info("removing location callback on stop");
								Ti.API.info("currentActivity: " + JSON.stringify(Ti.Android.currentActivity));
								Titanium.Geolocation.removeEventListener('location', locationCallback);
								Titanium.Geolocation.removeEventListener('heading', headingCallback);
							});
		
							win.addEventListener('androidback', exitNavigationMode);
	
						}
						else {
							deviceCompass = false;
							Titanium.API.info("No Compass on device");
							Ti.UI.createAlertDialog({
								title : L('app_name'),
								message : 'Compass was not found on this device. We will not be able to tell you the direction your car is towards.',
								buttonNames : ['Okay']
							}).show();
	
						}
					}
	
				}
			});
			dialog.show();
		}
	});
	win.add(navButton);

	this.open = function(){win.open();};
	this.mapView = mapView;

	return this;
}

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

	//Ti.API.info("distance: " + dist + " " + unit);

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

var translateErrorCode = function(code) {
	if (code == null) {
		return null;
	}
	switch (code) {
		case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
			return "Location unknown";
		case Ti.Geolocation.ERROR_DENIED:
			return "Access denied";
		case Ti.Geolocation.ERROR_NETWORK:
			return "Network error";
		case Ti.Geolocation.ERROR_HEADING_FAILURE:
			return "Failure to detect heading";
		case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
			return "Region monitoring access denied";
		case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
			return "Region monitoring access failure";
		case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
			return "Region monitoring setup delayed";
	}
};
//make constructor function the public component interface
module.exports = ApplicationWindow;
 


