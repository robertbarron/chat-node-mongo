var confirmationController = function () {
	this.templateManager;
};

confirmationController.prototype = {
	constructor: confirmationController,

	setModel : function (model) {
		this.model = model;
	},
	
	setTemplateManager : function (templateManager) {
		this.templateManager = templateManager;
	},

	render: function (template, idSection, callback) {
		var _this = this;

		this.templateManager.getView('templates/user-confirmation.html', function (response) {
			if (response) {
				_this.templateManager.$loadView(response, $('#chat-app'), undefined);
				if (callback)
					callback(true);
			}
		});
	}
};