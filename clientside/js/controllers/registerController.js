var registerController = function () {
	this.templateManager;
	this.model;
};

registerController.prototype = {
	constructor: registerController,

	setModel : function (model) {
		this.model = model;
	},
	
	setTemplateManager : function (templateManager) {
		this.templateManager = templateManager;
	},

	displayInfo: function (message, id) {
		$(id).html('<div class="info"><div class="info-ico icon-info-circled"></div>' + message + '</div>');
	},

	displayError: function (message, id) {
		$(id).html('<div class="error-ico icon-attention-1"></div>' + message);
	},

	_testLength : function (id, value, callback) {
		var _this = this;
		switch (id) {
			case "correo":
				if (value.length > 40)
					callback(true, false, {"message": "Longitud del Correo no debe ser mayor a 40 caracteres"});
				else
					callback(false, false, {});
				break;
			case "telefono":
				if (value.length > 10)
					callback(true, false, {"message": "Longitud de Tel&eacute;fono no debe ser mayor a 10 caracteres"});
				else
					callback(false, false, {});
				break;
			case "pass":
				if (value.length > 10)
					callback(true, false, {"message": "Longitud de Clave no debe ser mayor a 10 caracteres"});
				else
					callback(false, false, {});
				break;
			case "passconfirma":
				if (value.length > 10)
					callback(true, false, {"message": "Longitud de Clave no debe ser mayor a 10 caracteres"});
				else
					callback(false, false, {});
				break;
			case "user":
				if (value.length > 30)
					callback(true, false, {"message": "Longitud de Usuario no debe ser mayor a 30 caracteres"});
				else
					callback(false, false, {});
				break;
			case "nickname":
				if (value.length > 30)
					callback(true, false, {"message": "Longitud de Nickname no debe ser mayor a 30 caracteres"});
				else
					callback(false, false, {});
				break;
		}
	},

	_onlyNumber: function (number) {
		var re = /^[0-9]*$/gm;
		return re.test(number);
	},

	_isEmail: function (email, callback) {
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    	
    	if (re.test(email)) {
    		callback(false, false, true);
    	} else {
    		callback(true, false, {"message": "Agregue una direcci&oacute;n de correo v&aacute;lida"});
    	}
	},

	_clave: function (clave, id, callback) {
		if (id == 'pass') {
			var confirma = $('#chat-app #register #passconfirma').val();
			if (clave === confirma)
				callback(false, false, true);
			else
				callback(true, false, {"message": "La Clave y la confirmaci&oacute;n no coinciden"});
		} else {
			var confirma = $('#chat-app #register #pass').val();
			if (clave === confirma)
				callback(false, false, true);
			else
				callback(true, false, {"message": "La Clave y la Confirmaci&oacute;n no coinciden"});
		}
	},

	_isPhone: function (phone, callback) {
		if (phone.length != 10) {
			callback(true, false, {"message": "Agregue un n&uacute;mero de tel&eacute;fono v&aacute;lido (solo números)"});
		} else {
			if (this._onlyNumber(phone) )
				callback(false, false, true);
			else
				callback(true, false, {"message": "Por favor, agregue solo n&uacute;meros"});
		}
	},

	_testUser: function (value, callback) {
		this.model.tryUser(value, function (response) {
			if (response) {
				callback(false, true, {"message" : "Usuario disponible"});
			} else {
				callback(true, false, {"message" : "Alguien ya tiene este nombre de usuario"});
			}
		});
	},

	_testNick: function (value, callback) {
		this.model.tryNick(value, function (response) {
			if (response) {
				callback(false, true, {"message" : "Nickname disponible"});
			} else {
				callback(true, false, {"message" : "Alguien ya tiene este Nickname"});
			}
		});
	},

	_testMail: function (value, callback) {
		this.model.tryMail(value, function (response) {
			if (!response) {
				callback(true, false, {"message" : "Este correo ya se encuentra registrado."});
			} else {
				callback(false, true, {"message" : "Correo disponible"});
			}
		});
	},

	_addUserRegistration: function (data) {
		this.model.addField(data);
	},

	validateAll: function (callback) {
		var _this = this,
			haveError = false;
			main = $("#chat-app #register .input-text");
		
		this.model._initData();

		$.each(main, function (index, item) {
			_this.validate($(item).attr('id'), $(item).val(), function (error, info, response) {
				if (error) {
					haveError = true;
				}
			});
		}).promise().done( function () { 
			callback(haveError);
		});
	},

	_validateEmail: function (value, callback) {
		var _this = this;

		this._isEmail(value, function (error, info, response) {
			if (!error && !info) {
				_this._testMail(value, function (error, info, response) {
					callback(error, info, response);	
				});
			} else {
				callback(error, info, response);
			}
		});
	},

	validate: function (id, value, callback) {
		var _this = this;
		this._testLength(id, value, function (error, info, response) {
			if (error) {
				callback(error, info, response);;
			} else {
				switch (id) {
					case "correo":
						_this._addUserRegistration({"id": id, "value": value});

						_this._validateEmail(value, function (error, info, response) {
							callback(error, info, response);
						});
						break;
					case "telefono":
						_this._addUserRegistration({"id": id, "value": value});
						this._isPhone(value, function (error, info, response) {
							callback(error, info, response);
						});
						break;
					case "pass":
						_this._addUserRegistration({"id": id, "value": value});
						_this._clave(value, 'pass', function (error, info, response) {
							callback(error, info, response);
						});
						break;
					case "passconfirma":
						_this._clave(value, 'passconfirma', function (error, info, response) {
							callback(error, info, response);
						});
						break;
					case "user":
						_this._addUserRegistration({"id": id, "value": value});
						_this._testUser(value, function (error, info, response) {
							callback(error, info, response);
						});
						break;
					case "nickname":
						_this._addUserRegistration({"id": id, "value": value});
						_this._testNick(value, function (error, info, response) {
							callback(error, info, response);
						});
						break;
				}
			}
		});
	},

	tryRegister: function (callback) {
		this.model.register(function (response) {
			callback(response);
		});
	},

	loadRegister: function () {
		this.render('templates/user-registration.html', $('#chat-app'));
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