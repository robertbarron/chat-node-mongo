var mainController = function () {
	this.model;
	this.teplateManager;
}
mainController.prototype = {
	constructor : mainController,

	_checkStatus : function (callback) {
		if ( typeof(Storage) !== "undefined" ) {
			callback({'supported': true});
		} else {
			callback({'supported': false});
		}
	},

	_setLocalStorage : function (userInfo) {
		localStorage.setItem('localUser', JSON.stringify(userInfo));
	},

	_getUser : function (callback) {
		var userObject = localStorage.getItem('localUser');

		callback($.parseJSON(userObject));
	},

	loadLocalUser: function (chatController, loginController) {
		var _this = this;
		this._getUser(function (user) {
			if (user == undefined) {
				loginController.loadLogin();
			} else {
				if (user.nickname == undefined) {
					loginController.loadLogin();
				} else {
					loginController.loadSavedUser(user, function (error, info, message, savedUser) {
						if (savedUser) {
							chatWC.setUser(user);
							chatController.loadChat(user, function (response) {
								if (response) {
									$('body').addClass('chat-active');
									chatController.messageListener();
									chatController.newUserListener();
								}
							});
						} else {
							loginController.loadLogin();
						}
					});
				}
			}
		});
	}
};