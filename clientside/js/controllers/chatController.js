var chatController = function () {
	this.templateManager;
	this.model;
	this.socket = io();
	this.nickname;
	this.hexa;
	this.imageUrl;
	this.id_user;
};

chatController.prototype = {
	constructor: chatController,

	setModel : function (model) {
		this.model = model;
	},
	
	setTemplateManager : function (templateManager) {
		this.templateManager = templateManager;
	},
	
	_setImageUrl : function (image) {
		if (image == undefined)
			return 'user_images/default-user.jpeg';
		else
			return 'user_images/' + image;
	},

	_setUserInfo: function (userInfo, callback) {
		this.id_user  = userInfo.id_user;
		this.nickname = userInfo.nickname;
		this.hexa     = userInfo.hexa;
		this.imageUrl = this._setImageUrl(userInfo.imageUrl);
		callback(true)
	},

	loadChat: function (userInfo, callback) {
		var _this = this;
		this.render('templates/chat-view.html', $('#chat-app'), function (response) {
			_this._setUserInfo(userInfo, function (response) {
				if (response) {
					_this._emitUser();
					if (callback)
						callback(true);
				}
			});
		});
	},
	
	_insertList: function (item) {
		item.imageUrl = this._setImageUrl(item.imageUrl);
		if (item.id_user != this.id_user) {
			item.me = "";
			this.renderUser(item);
		} else {
			item.nickname = "Me";
			item.me = "me-class";
			this.renderUser(item);
		}
	},

	newUserListener: function () {
		var _this = this;
		this.socket.on("listupdate", function (data) {
			console.log("data");
			console.log(data);
			$.each(data, function(index, item) {
				_this._insertList(item);
			});
		});
	},

	_emitUser: function () {
		var _this = this;
		this.socket.emit("userlogin", {
			"id_user": _this.id_user, 
			"nickname": _this.nickname,
			"hexa": _this.hexa,
			"imageUrl": _this.imageUrl
		});
	},

	_constructMessage: function (message, callback) {
		var _this = this,
			newmessage = {
				"id_user" : this.id_user,
				"nickname" : this.nickname,
				"hexa" : this.hexa,
				"imageUrl" : this.imageUrl,
				"message": message
			};
		callback(newmessage);
	},

	sendMessage: function (message, callback) {
		var _this = this;
		this._constructMessage(message, function (new_message) {
			_this.socket.emit("message", new_message);	
		});
	},

	renderUser: function (messageBody) {
		var _this = this,
			$id = $('#chat-app #chat-view #chat-users'),
			template = 'templates/new-user.html';
			
		$id.empty();
		this.templateManager.getView(template, function (response) {
			if (response) {
				_this.templateManager.$appendView(response, $id, messageBody);
			}
		});
	},

	renderMessage: function (messageBody) {
		var _this = this,
			$id = $('#chat-app #chat-view #chat-container'),
			template = 'templates/user-message-normal.html';

		this.templateManager.getView(template, function (response) {
			if (response) {
				_this.templateManager.$appendView(response, $id, messageBody);
				$id.animate({ scrollTop: $id.height() }, "slow");
			}
		});
	},

	_sanitizeMessage: function (stringValue) {
		return stringValue.replace(/&\w+?;/g, function (e) {
		    switch (e) {
		        case '&nbsp;': 
		            return ' ';
		        case '&tab;': 
		            return '\t';
		        case '&copy;': 
		            return String.fromCharCode(169);
		        default: 
		            return e;
		    }
		});
	},

	_cleanContainer: function () {
		$('#chat-app #message').val('');
	},

	messageListener: function () {
		var _this = this;

		this.socket.on("newmessage", function (data) {
			_this.renderMessage(data);
			if (data.id_user === _this.id_user)
				_this._cleanContainer();
		});
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



