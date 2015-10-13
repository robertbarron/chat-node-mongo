var loginModel = function () {
	this.id;
	// this.username;
	this.nickname;
	this.email;
	this.phone;
	this.hexa;
	this.imageUrl;
};

loginModel.prototype = {
	constructor: loginModel,

	_setInfo: function(data) {
		data.imageUrl = data.imageUrl ? "user_images/" + data.imageUrl : ("user_images/default-user.jpeg");
		this.id_user = data.id;
		// this.username = data.username;
		this.nickname = data.nickname;
		this.imageUrl = data.imageUrl;
		this.email = data.email;
		this.phone = data.phone;
		this.hexa = this._getHexa();
	},

	_getHexa: function () {
		return '#'+Math.floor(Math.random()*16777215).toString(16);
	},

	getLogin: function (user, pass, callback) {
		var _this = this;
		this._send('GET', '/trylogin', {'username' :user, 'clave' : pass}, function (response, data) {
			if (response) {
				callback(true, data);
			} else {
				callback(false, {'error' : true});
			}
		});
	},

	getInfo: function () {
		return {
			'id_user': this.id_user, 
			// 'username': this.username,
			'nickname': this.nickname,
			'email': this.email,
			'phone': this.phone,
			'imageUrl': this.imageUrl,
			'hexa': this._getHexa()
		};
	},

	_send: function (protocolo, url, data, callback) {
		$.ajax({
			type: protocolo,
			url: url,
			data: data,
			success: function (response) {
				callback(true, response);
			},
			error: function () {
				callback(false, false);
			}
		});
	}
};