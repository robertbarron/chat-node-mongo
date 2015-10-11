var registerModel = function () {
	this.collection = {};
};

registerModel.prototype = {
	constructor: registerModel,

	_initData: function () {
		this.collection = {};
	},

	addField: function (data) {
		this.collection[data.id] = data.value;
	},

	tryMail: function (mail, callback) {
		this._send('GET', '/trymail', {"mail": mail}, function (response, data) {
			if (!data.exists) {
				callback(true);
			} else {
				callback(false);
			}
		});
	},

	tryUser: function (user, callback) {
		this._send('GET', '/tryuser', {"username": user}, function (response, data) {
			if (!data.exists) {
				callback(true);
			} else {
				callback(false);
			}
		});
	},

	tryNick: function (nick, callback) {
		this._send('GET', '/trynick', {"nickname": nick}, function (response, data) {
			if (!data.exists) {
				callback(true);
			} else {
				callback(false);
			}
		});
	},

	register: function (callback) {
		var _this = this;
		this._send('POST', '/tryregister', {"data": _this.collection}, function (response, data) {
			if (response) {
				callback(true);
			} else {
				callback(false);
			}
		});
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