function getCarvoyantData(_cb) {
	var xhr = Titanium.Network.createHTTPClient({
		username : "bf445b8f-7c54-4173-8423-c59575d7c858",//APIKey,
		password : "2092622a-7d01-49f6-9257-94cd0a3b27bf" //APIToken
	});
	xhr.onload = function() {
		_cb(JSON.parse(this.responseText));
	};
	xhr.open("GET", "https://dash.carvoyant.com/api/vehicle", false);
	xhr.send();
};
exports.getVehicles = function() {
	var data = [];
	getCarvoyantData(function(_data) {
		for (var i = 0; i < _data.vehicle.length; i++) {
			data.push({
				title : _data.vehicle[i].name,
				waypoint : {
					timestamp : moment(_data.vehicle[i].lastWaypoint.timestamp, "YYYY-MM-DDTHH:mm:ssZ"),
					longitude : _data.vehicle[i].lastWaypoint.longitude,
					latitude : _data.vehicle[i].lastWaypoint.latitude
				},
				hasCheck : false
			});
		};
		var dataIndex = -1;
		if (Ti.App.Properties.hasProperty("defaultVehicle")) {
			var defaultVehicle = Ti.App.Properties.getObject("defaultVehicle");
			for (var i = 0; i < data.length; i++) {
				if (data[i].title == defaultVehicle.title) {
					dataIndex = i;
				}
			}
		}
		if (dataIndex == -1) {
			Ti.App.Properties.setObject("defaultVehicle", data[0]);
			data[0].hasCheck = true;
		} else {
			Ti.App.Properties.setObject("defaultVehicle", data[dataIndex]);
			data[dataIndex].hasCheck = true;
		}
		Ti.App.Properties.setList("vehicleData", data);
		Ti.App.fireEvent('app:dataLoaded');
	});
};
