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

	_getContactByContainer : function (container) {
		var user = {};
		user.id_user  = container.data('id') || null;
		user.nickname = container.find('.nickname').data('nickname') || null;
		user.imageUrl = container.find('.user-profile img').attr('src') || null;
		user.phone    = container.data('phone') || null;
		user.email    = container.data('email') || null;
		return user;
	},

	_getContactByUid : function (uid) {
		var _this = this;
		this._checkWindowByUid(uid, function (flag, container) {
			if (container)
				return _this._getContactByContainer(container);
			else
				return false;
		});
	},

	_getContactById : function (search, callback) {
		var $container = $('#chat-app #chat-view #users-container #chat-users .user'),
			user = {},
			found = false;

		$.each($container, function (index, item) {
			$item = $(item);
			id_user = $item.data('id');

			if (id_user == search) {
				found = true;
				user.nickname = $item.find('.user-info-container .nickname').data('nickname');
				user.id_user  = $item.data('id');
				user.email    = $item.data('email');
				user.phone    = $item.data('phone');
				user.imageUrl = $item.find('.user-info-container .image-url').data("imageurl");
			}

		}).promise().done( function () {
			if (found) {
				if (callback)
					callback(user);
				else
					return user;
			} else {
				if (callback)
					callback(false);
				else
					return false;
			}
		});
	},

	getContactInfo : function (container, uid, id_user) {
		var _this = this,
			user = {};
		if (container != undefined)
			return _this._getContactByContainer(container);
		else if (uid != undefined) {
			return _this._getContactByUid(uid);
		} else if (user != undefined) {
			return _this._getContactById(id_user);
		}
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

		if ($chatContainer.length == 1)
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

	createWindow : function (user, callback) {
		var template       = 'templates/chat-individual/private-chat-window.html',
			$chatContainer = $('#chat-app #chat-view #active-chat-windows');

		$('#chat-app #active-chat-windows').addClass('active');
		this.renderPrivateWindow($chatContainer, user, function (response) {
			if (callback)
				callback(true);	
		});
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
		var _this = this,
			user;

		this.model.listenNewMessage(function (response) {
			console.log("mensaje recibido");
			console.log(response);
			if (response.uid) {
				_this._checkWindowByUid(response.uid, function (found, container) {
					if (found) {
						contact = _this._constructIncomingMessage(response, response);
						_this.renderIncomingMessage(response);
						if (!_this._isOpen(container))
							_this._showWindow(response.uid);
					} else {
						user = _this.getContactInfo(undefined, response.uid, undefined);
						if (!user) {
							_this._getContactById(response.sender_id, function (contact) {
								contact = _this._constructIncomingMessage(contact, response);
								_this.createWindow(contact, function (response) {
									if (response)
										_this.renderIncomingMessage(contact);
								});
							});
						}
					}
				});
			}
		});
	},
	_constructIncomingMessage: function (user, data) {
		user.message     = data.message;
		user.relation_id = data.uid;
		user.isme        = 'notme';
		return user;
	},

	_constructMessage: function (uid, message, callback) {
		var _this = this,
			user  = this._getContactByUid(uid);
		debugger;
		if (!found) {
			//Enviar Error
		} else {
			info.message = message;
			console.log(info);
			callback(info);
		}
	},

	_cleanContainer: function (container) {
		if (container)
			container.find('#message').val('');
	},

	sendMessage: function (uid, message, messagetype) {
		var _this = this,
			messagetype  = messagetype ? messagetype : 'chatmessage';

		this._constructMessage(uid, message, function (new_message) {
			console.log("new message");
			console.log(new_message);
			_this.model.broadcastMessage(messagetype, new_message, function (messagepacket) {
				console.log("messagepacket");
				console.log(messagepacket);
				if (messagepacket) {
					messagepacket.isme = 'isme';
					_this.renderPrivateMessage(messagepacket);
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

	renderIncomingMessage: function (packet) {
		var _this = this,
			template = "templates/chat-individual/user-message.html";
		this._checkWindowByUid(packet.relation_id, function (flag, container) {
			debugger;
			_this._cleanContainer(container);

			container = container.find('#chat-container');
			_this.templateManager.getView(template, function (response) {
				if (response)
					_this.templateManager.$appendView(response, container, packet);
			});
		});
	},

	renderPrivateMessage: function (packet) {
		var _this = this,
			template = "templates/chat-individual/user-message.html";

		this._checkWindowByUid(packet.uid, function (flag, container) {
			_this._cleanContainer(container);

			container = container.find('#chat-container');
			_this.templateManager.getView(template, function (response) {
				if (response)
					_this.templateManager.$appendView(response, container, packet);
			});
		});
	},

	renderPrivateWindow: function ($id, messageBody, callback) {
		var _this = this,
			template = "templates/chat-individual/private-chat-window.html";

		this.templateManager.getView(template, function (response) {
			if (response) {
				_this.templateManager.$appendView(response, $id, messageBody);
				if (callback)
					callback(true);
			}
		});
	}

};