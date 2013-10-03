function ApplicationTabGroup() {
	//create module instance
	var self = Ti.UI.createTabGroup();
			
	var Window = require('ui/handheld/ApplicationWindow');
	
	//create app tabs
	var ApplicationWin = new Window()
	
	var tab = Ti.UI.createTab({
		title: L('app_name'),
		window: ApplicationWin
	});
	ApplicationWin.containingTab = tab;
	self.addTab(tab);
	
	return self;
};

module.exports = ApplicationTabGroup;
