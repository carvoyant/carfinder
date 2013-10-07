var SettingsWindow = function(containingTab) {
	var osname = Titanium.Platform.osname;
	var myfontsize = (Titanium.Platform.displayCaps.platformHeight * 4) / 100;
	var win = Ti.UI.createWindow({
		title : "Settings",
		navBarHidden : false
	});
	if (osname == 'android') {
		win.backgroundColor = 'black';
	} else {
		win.backgroundColor = '#aebcad';
	}

	var firstSection = Ti.UI.createTableViewSection();
	var secondSection = Ti.UI.createTableViewSection();

	if (osname === 'android') {
		var myAccountRow = Ti.UI.createTableViewRow({
			title : 'My Account',
			height : myfontsize * 2,
			font : {
				fontSize : myfontsize
			}
		});
		
		var satViewRow = Ti.UI.createTableViewRow({
			title : 'Satellite View',
			height : myfontsize * 2,
			font : {
				fontSize : myfontsize
			}
		});
		
	} 
	else {
		var firstRow = Ti.UI.createTableViewRow({
			title : 'Account Info',
			hasChild : true
		});
		var secondRow = Ti.UI.createTableViewRow({
			title : 'Default Car',
			hasChild : true
		});
		var thirdRow = Ti.UI.createTableViewRow({
			title : 'Units'
		});
		var fourthRow = Ti.UI.createTableViewRow({
			title : 'About Point to my Car?',
			hasChild : true
		});
	};

	satViewRow.hasCheck = Ti.App.Properties.getBool("mapType");
	firstSection.add(myAccountRow);
	firstSection.add(satViewRow);


	satViewRow.addEventListener('click', function(e) {
		e.source.hasCheck = !e.source.hasCheck;
		Ti.App.Properties.setBool('mapType', e.source.hasCheck);
		Ti.App.fireEvent('satClick', {hasCheck: e.source.hasCheck});
			
	});

	
	
	myAccountRow.addEventListener('click', function() {
	 
	    Titanium.Platform.openURL("http://dash.carvoyant.com"); 

	});

	var tableView = Ti.UI.createTableView({
		data : [firstSection, secondSection]
	});
	if (osname === 'iphone') {
		tableView.style = Ti.UI.iPhone.ListViewStyle.GROUPED;
	}
	win.add(tableView);

	// Create a Button.
	var logoutButton = Ti.UI.createButton({
		title : 'Logout',
		height : Ti.UI.SIZE,
		color : '#F00'
	});

	// Listen for click events.
	logoutButton.addEventListener('click', function() {
        Ti.API.info('Removed the Username and Password: ' + Ti.App.Properties.getString('Username') + Ti.App.Properties.getString('Password'));
		Ti.App.Properties.removeProperty('Username');
		Ti.App.Properties.removeProperty('Password');
		var activity = Titanium.Android.currentActivity;
        activity.finish();
	});

	// Add to the parent view.
	win.add(logoutButton);

	if (Ti.Platform.osname === 'iphone') {

		// Create a Button.
		var Close = Ti.UI.createButton({
			title : 'Close',
			style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
		});

		// Listen for click events.
		Close.addEventListener('click', function() {
			win.close({
				animated : true
			});
		});

		// Add to the parent view.
		win.setLeftNavButton(Close);

	}

	return win;
};

module.exports = SettingsWindow;