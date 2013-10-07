/*
* Single Window Application Template:
* A basic starting point for your application.  Mostly a blank canvas.
*
* In app.js, we generally take care of a few things:
* - Bootstrap the application with any data we need
* - Check for dependencies like device type, platform version or network connection
* - Require and open our top-level UI component
*
*/

//bootstrap and check dependencies
if (Ti.version < 1.8) {
	alert(L('sorry_app_req') + ' Titanium Mobile SDK 1.8 '+ L('or_later'));
}



// set units based on locale (America and Burma use Imperial)
if (Ti.Locale.currentLocale == "en-US" || Ti.Locale.currentLocale == "my-MM") {
	Ti.App.Properties.setString("unitSystem", "Imperial");
}

// the rest of the world uses Metric
else {
	Ti.App.Properties.setString("unitSystem", "Metric");
}
	
var moment = require('lib/moment');

Ti.Geolocation.purpose = L('app_purpose');
if (Ti.Platform.osname == 'iphone')
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST_FOR_NAVIGATION;
else {
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_HIGH;
	Ti.Gesture.addEventListener('orientationchange', function(e) {
		Ti.Android.currentActivity.setRequestedOrientation(Ti.Android.SCREEN_ORIENTATION_PORTRAIT);
	});
}
// This is a single context application with multiple windows in a stack
(function() {
	var osname = Ti.Platform.osname;
	var carvoyantConnect = require('lib/CarvoyantConnect');
	carvoyantConnect.getVehicles();

	if (!Ti.App.Properties.hasProperty("unitSystem")) Ti.App.Properties.setString("unitSystem", "Imperial");

	// Android usecurrentActivitys platform-specific properties to create windows.
	// All other platforms follow a similar UI pattern.
	if (osname === 'android') {
		Ti.App.addEventListener('app:dataLoaded', function(e){
			if(Titanium.UI.currentWindow!=null) Titanium.UI.currentWindow.close();
			var Window = require('ui/handheld/android/ApplicationWindow');
			new Window().open();
		});
	} else {
		
		var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
		new ApplicationTabGroup().open();
	}

})();
