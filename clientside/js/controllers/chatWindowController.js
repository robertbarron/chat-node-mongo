var chatWindowController = function () {
	this.templateManager;
	this.model;
};

chatWindowController.prototype = {
	constructor: chatWindowController,
	
	setModel : function (model) {
		this.model = model;
	},
	
	setTemplateManager : function (templateManager) {
		this.templateManager = templateManager;
	},

	setUser : function (data) {
		this.model.setUser(data);
	},

	_checkWindowByUser: function (user, callback) {
		var $chatContainer = $('#chat-app #chat-view #active-chat-windows .private-chat-window'),
			uid = "",
			nickname = "";

		$.each($chatContainer, function (index, item) {
			nickname = $(item).find('.info-user-chat .nickname').data('nickname');
			if (nickname == user.nickname) {
				uid = $(item).data('uid');
			}
		}).promise().done( function () {
			if (uid.length > 5) {
				callback(true, uid);
			} else {
				callback(false, false);
			}
		});
	},

	_checkWindowByUid: function (uid, callback) {
		var $chatContainer = $('#chat-app #chat-view #active-chat-windows .private-chat-window[data-uid="' + uid + '"]');

		if ($chatContainer == 1)
			callback(true, $chatContainer);
		else
			callback(false, false);
	},

	_isOpen : function ($container) {
		if ($container.hasClass("active"))
			return true;
		else
			return false;
	},

	_showWindow: function (uid) {
		$('#chat-app #active-chat-windows').addClass('active');
		$('#chat-app #chat-view #active-chat-windows .private-chat-window[data-uid="' + uid +'"]').show();
	},

	_hideWindow : function (uid) {
		$('#chat-app #chat-view #active-chat-windows .private-chat-window[data-uid="' + uid +'"]').hide();	
	},

	createWindow : function (user) {
		var template       = 'templates/chat-individual/private-chat-window.html',
			$chatContainer = $('#chat-app #chat-view #active-chat-windows');

		$('#chat-app #active-chat-windows').addClass('active');
		this.renderPrivateWindow($chatContainer, user);
	},
	
	_createConnection : function (type, user, callback) {
		var _this = this;
		this.model.broadcastMessage(type, user, function (response) {
			callback(response);
		});
	},

	newConnection : function (user) {
		var _this = this;

		this._checkWindowByUser(user, function (found, uid) {
			if (!found) {
				_this._createConnection('newconection', user, function (response) {
					if (response.relation_id) {
						user.relation_id = response.relation_id;
						_this.createWindow(user);
					}
				});
			} else {
				_this._showWindow(uid);
			}
		});
	},
	
	newConnectionListener: function () {
		var _this = this;

		this.model.listenConnection(function (response) {
			console.log(response);
		});
	},

	newMessageListener: function () {
		var _this = this;

		this.model.listenNewMessage(function (response) {
			if (response.uid) {
				_this._checkWindowByUid(response.uid, function (found, container) {
					if (found) {
						_this._constructReceivedMessage(response.uid, response.message, container);
						if (!_this.isOpen(container))
							_this._showWindow(response.uid);
					} else {
						console.log("response");
						console.log(response);
					}
						// get user info
						// create window
				});
			}
		});
	},

	// _constructReceivedMessage : function (uid, message, container) {
	// 	var _this = this;
	// 	this.model.getRelationUser(uid, function (found, info) {
	// 		if (!found)
	// 			callback(false);
	// 		else {
	// 			info.message = message;
	// 			_this.renderPrivate(container, response);
	// 		}
	// 	});
	// },

	_constructMessage: function (uid, message, callback) {
		var _this = this;
		this.model.getRelationUser(uid, function (found, info) {
			if (!found) {
				//Enviar Error
			} else {
				user.message = message;
				callback(user);
			}
		});
	},

	sendMessage: function (uid, message, messagetype) {
		var _this = this,
			messagetype  = messagetype ? messagetype : 'chatmessage';

		this._constructMessage(uid, message, function (new_message) {
			console.log("new message");
			console.log(new_message);
			_this.model.broadcastMessage(messagetype, new_message, function (response) {
				if (callback){
					debugger;
					callback(response);
				}
			});	
		});
	},

	render: function (template, idSection, data, callback) {
		var _this = this;

		this.templateManager.getView(template, function (response) {
			if (response) {
				_this.templateManager.$loadView(response, idSection, data);
				if (callback)
					callback(true);
			}
		});
	},

	renderPrivateWindow: function ($id, messageBody) {
		var _this = this,
			template = "templates/chat-individual/private-chat-window.html";
		
		this.templateManager.getView(template, function (response) {
			if (response)
				_this.templateManager.$appendView(response, $id, messageBody);
		});
	}

};