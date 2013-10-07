//Application Window Component Constructor
function ApplicationWindow() {
	var win = Ti.UI.createWindow({
		title:"Your vehcle",
		backgroundColor:'#fff',
		navBarHidden: true,
		tabBarHidden: true
	});
	
	var vehicleData = Ti.App.Properties.getList("vehicleData");
	var selectedVehicle = Ti.App.Properties.getObject("defaultVehicle");
	
	var Map = require('ui/common/MapView');
	var mapView = Map.createMap(selectedVehicle);
	mapView.setAnnotations([Map.createVehiclePin(selectedVehicle)]);
	win.add(mapView);
	
	var settingsButton = Titanium.UI.createButton({
		image:'/images/gear.png',
		width:30,
		right:5,
		style: Ti.UI.iPhone.SystemButtonStyle.BORDERED
	});
	settingsButton.addEventListener('click', function()
	{
		var SettingWin = require('ui/common/SettingsWindow');
		var settings = new SettingWin(win.containingTab);
		win.containingTab.open(settings,{transition:Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
		//settings.open({modal:true});
	});
	
	var selectVehicleButton = Titanium.UI.createButton({
		title: selectedVehicle.title,
		style: Ti.UI.iPhone.SystemButtonStyle.BORDERED
	});
	selectVehicleButton.addEventListener('click', function()
	{
		var options = [];
		for(var i=0; i<vehicleData.length; i++){
			options.push(vehicleData[i].title);
		}
		options.push("Cancel");
		var opts = {
		  cancel: vehicleData.length,
		  options: options,
		  title: 'Select Vehicle'
		};
		
		var dialog = Ti.UI.createOptionDialog(opts);
		dialog.addEventListener('click', function(e){
			if(e.index!=e.cancel){
				selectedVehicle = vehicleData[e.index];
				Map.resetPin_Map(mapView, selectedVehicle);
				selectVehicleButton.setTitle(selectedVehicle.title);
			}
		});
		dialog.show();
	});
	
	var navButton = Titanium.UI.createButton({
		image:'/images/arrowhead_left.png',
		width:30,
		right:5,
		style: Ti.UI.iPhone.SystemButtonStyle.BORDERED
	});
	navButton.addEventListener('click', function()
	{
		var dialog = Titanium.UI.createAlertDialog({
			title:'Directions',
			message:'Would you like us to walk you to your car?',
			buttonNames:['Yes', 'No, take me to Google Maps', 'Cancel'],
			cancel:2
		});
		dialog.addEventListener('click', function(e){
			if(e.index==0){
				var WalkMeWindow = require('ui/common/WalkMeWindow');
				var walkingNavWin = new WalkMeWindow(selectedVehicle);
				walkingNavWin.open({modal:true, modalTransitionStyle:Titanium.UI.iPhone.MODAL_TRANSITION_STYLE_FLIP_HORIZONTAL});
			}
		});
		dialog.show();
	});
/*	
	var flexSpace = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	
	var mapStyleBar = Titanium.UI.iOS.createTabbedBar({
	    labels:['Std', 'Hyb', 'Sat'],
	    backgroundColor: 'black',
	    top:5,
	    right:5,
	    index:1,
	    style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
	    height:25
	});
	mapStyleBar.addEventListener('click',function(e){
		switch(e.index)
		{
		case 0:
		  	mapView.setMapType(Titanium.Map.STANDARD_TYPE);
		 	break;
		case 1:
		 	mapView.setMapType(Titanium.Map.HYBRID_TYPE);
		 	break;
		case 2:
			mapView.setMapType(Titanium.Map.SATELLITE_TYPE);
		  	break;
		}
	});
	win.add(mapStyleBar);
	
	var toolbar = Titanium.UI.iOS.createToolbar({
		items:[settingsButton, flexSpace, selectVehicleButton,flexSpace, navButton],
		bottom:0,
		borderTop:true,
		borderBottom:false,
		translucent:true,
		barColor:'black'
		//barColor:(colorSetting)?'gray':'black'
	});	
	win.add(toolbar);
*/	
	return win;
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
