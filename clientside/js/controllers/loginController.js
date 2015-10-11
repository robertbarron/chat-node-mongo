var loginController = function () {
	this.templateManager;
	this.model;
};

loginController.prototype = {
	constructor: loginController,

	setModel : function (model) {
		this.model = model;
	},
	
	setTemplateManager : function (templateManager) {
		this.templateManager = templateManager;
	},

	loadLogin: function () {
		this.render('templates/user-login.html', $('#chat-app'));
	},

	displayInfo: function (message, id) {
		$(id).html('<div class="info"><div class="info-ico icon-info-circled"></div>' + message + '</div>');
	},

	displayError: function (message, id) {
		$(id).html('<div class="error-ico icon-attention-1"></div>' + message);
	},

	_responseSwitcher : function (data, callback) {
		if (data.tries) {
			callback(false, true, {'message' : 'Su usuario y clave no coinciden. Restan ' + data.triesLeft + ' intentos.'}, false);
		} else if (data.notfound) {
			callback(true, false, {'message' : 'Su usuario y clave no coinciden.'}, false);
		} else if (data.blocked) {
			callback(true, false, {'message' : 'Su usuario ha sido bloqueado. Por favor intente de nuevo en ' + data.hoursLeft + ' horas'}, false);
		} else if (data.logged) {
			this.model._setInfo(data.user);
			callback(false, false, {}, true);
		}
	},

	tryLogin: function (user, pass, callback) {
		var _this = this;

		this.model.getLogin(user, pass, function (response, data) {
			if (response) {
				if (!data.error) {
					_this._responseSwitcher(data, function (error, info, response, secureFlag) {
						callback(error, info, response, secureFlag);
					});
				} else {
					callback(true, false, {"message": 'Algo salio mal, por favor, intenta mas tarde.'}, false);	
				}
			} else {
				callback(true, false, {"message": 'Algo salio mal, por favor, intenta mas tarde.'}, false);
			}
		});
	},
	
	getUser: function () {
		return this.model.getInfo();
	},

	render: function (template, idSection, callback) {
		var _this = this;

		this.templateManager.getView(template, function (response) {
			if (response) {
				_this.templateManager.$loadView(response, idSection, undefined);
				if (callback)
					callback(true);
			}
		});
	}
};