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
		var firstRow = Ti.UI.createTableViewRow({
			title : 'Account Info',
			height : myfontsize * 2,
			font : {
				fontSize : myfontsize
			}
		});
		var secondRow = Ti.UI.createTableViewRow({
			title : 'Default Car',
			height : myfontsize * 2,
			font : {
				fontSize : myfontsize
			}
		});
		var thirdRow = Ti.UI.createTableViewRow({
			height : myfontsize * 2
		});
		var titleLabel = Titanium.UI.createLabel({
			text : 'Unit',
			textAlign : 'left',
			left : 5,
			font : {
				fontSize : myfontsize
			}
		});
		var unitLabel = Titanium.UI.createLabel({
			text : Ti.App.Properties.getString("unitSystem"),
			textAlign : 'right',
			right : 5,
			font : {
				fontSize : myfontsize
			}
		});
		thirdRow.add(titleLabel);
		thirdRow.add(unitLabel);
		thirdRow.addEventListener('click', function() {
			if(Ti.App.Properties.getString("unitSystem")=="Metric") Ti.App.Properties.setString("unitSystem", "Imperial");
			else Ti.App.Properties.setString("unitSystem", "Metric");
			unitLabel.setText(Ti.App.Properties.getString("unitSystem"));
		});
		var fourthRow = Ti.UI.createTableViewRow({
			title : 'About Point to my Car?',
			height : myfontsize * 2,
			font : {
				fontSize : myfontsize
			}
		});
	} else {
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

	firstSection.add(firstRow);
	firstSection.add(secondRow);
	firstSection.add(thirdRow);
	secondSection.add(fourthRow);

	secondRow.addEventListener('click', function() {
		var DefaultCarWin = require('ui/common/DefaultCarWindow');
		var defaultCar = new DefaultCarWin();
		if (Ti.Platform.osname === 'iphone')
			containingTab.open(new DefaultCarWin());
		else
			defaultCar.open({
				modal : true
			});
	});

	var tableView = Ti.UI.createTableView({
		data : [firstSection, secondSection]
	});
	if (osname === 'iphone') {
		tableView.style = Ti.UI.iPhone.ListViewStyle.GROUPED
	}
	win.add(tableView)

	// Create a Button.
	var logoutButton = Ti.UI.createButton({
		title : 'Logout',
		height : Ti.UI.SIZE,
		color : '#F00'
	});

	// Listen for click events.
	logoutButton.addEventListener('click', function() {
		alert('\'Logout\' was clicked!');
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
