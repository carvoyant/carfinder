exports.getVehicles = function() {
	var data = [];
	
	var xhr = Titanium.Network.createHTTPClient({
		username : Ti.App.Username,
		password : Ti.App.Password
	});
	
	xhr.onload = function(e) {
		var response = JSON.parse(this.responseText);

		if(Ti.App.remember)
		{
			Ti.App.Properties.setString('Username', Ti.App.Username);
			Ti.App.Properties.setString('Password', Ti.App.Password);
						
		}
		SuccessfulLogin(response);
	};
	xhr.onerror = function(e) {
	  	alert(L('login_failure'));
	};
	
	xhr.open("GET", "https://dash.carvoyant.com/api/vehicle", false);
	xhr.send();

};

function SuccessfulLogin(_data)
{
	if(_data.vehicle[0].lastWaypoint==null)
	{
		alert("No vehicle data found");	
		return;
	}
		
	var data = [];

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
};
