var DefaultCarWindow = function(){
	var myfontsize = (Titanium.Platform.displayCaps.platformHeight * 4) / 100;
	var win = Ti.UI.createWindow({
		title: L('default_car')
	});
	if (Ti.Platform.name == 'android') 
	{
		win.backgroundColor = 'black';
	}
	else
	{
		win.backgroundColor = '#aebcad';
	}
	var tableData = Ti.App.Properties.getList("vehicleData");
	
	var tableView = Ti.UI.createTableView();
	
	if(Ti.Platform.name == 'android'){
		var data = [];
		for (var i=0;i<tableData.length; i++){
			data.push(Ti.UI.createTableViewRow({
				title: tableData[i].title,
				height: myfontsize*2,
				font:{fontSize: myfontsize},
				hasCheck:tableData[i].hasCheck
			}));
		}
		tableView.setData(data);
	}
	else tableView.setData(tableData);
	
	if (Titanium.Platform.osname === 'iphone') {
			tableView.style=Ti.UI.iPhone.ListViewStyle.PLAIN;
		}
	tableView.addEventListener('click', function(e){
		if(Ti.App.Properties.hasProperty("defaultVehicle")) {
			var defaultVehicleTitle = Ti.App.Properties.getObject("defaultVehicle").title;
			var defaultVehicleIndex = -1;
			for(var i = 0; i < tableData.length; i++)
			{
			  if(tableData[i].title == defaultVehicleTitle)
			  {
			    defaultVehicleIndex = i;
			  }
			}
			tableData[defaultVehicleIndex].hasCheck=false;
		}
		tableData[e.index].hasCheck=true;
		Ti.App.Properties.setObject("defaultVehicle", tableData[e.index]);
		Ti.App.Properties.setList("vehicleData", tableData);
		if(Ti.Platform.name == 'android'){
		var data = [];
		for (var i=0;i<tableData.length; i++){
			data.push(Ti.UI.createTableViewRow({
				title: tableData[i].title,
				height: myfontsize*2,
				font:{fontSize: myfontsize},
				hasCheck:tableData[i].hasCheck
			}));
		}
		tableView.setData(data);
	}
	else tableView.setData(tableData);
	});
	win.add(tableView);
	return win;
};

module.exports = DefaultCarWindow;