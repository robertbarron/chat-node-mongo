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
		return {
			'id_user'  : container.data('id') || null,
			'nickname' : container.find('.nickname').data('nickname') || null,
			'imageUrl' : container.find('.user-profile img').attr('src') || null,
			'phone'    : container.data('phone') || null,
			'email'    : container.data('email') || null
		};
	},

	_getContactByUid : function (uid, callback) {
		var _this = this,
			user = {};
		this._checkWindowByUid(uid, function (flag, container) {
			if (flag) {
				if (callback)
					callback(_this._getContactByContainer(container));
				else
					return _this._getContactByContainer(container);
			} else {
				if (callback)
					callback(false)
				else
					return false;
			}
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

	_checkWindowByUserId: function (user_id, callback) {
		var $chatContainer = $('#chat-app #chat-view #active-chat-windows .private-chat-window[data-id="' + user_id + '"]');

		if ($chatContainer.length == 1)
			callback(true, $chatContainer);
		else
			callback(false, false);
	},

	_checkWindowByUser: function (user, callback) {
		var $chatContainer = $('#chat-app #chat-view #active-chat-windows .private-chat-window'),
			uid = "",
			id  = "",
			nickname = "";

		$.each($chatContainer, function (index, item) {
			nickname = $(item).find('.info-user-chat .nickname').data('nickname');
			if (nickname == user.nickname) {
				id  = $(item).data('id');
				uid = $(item).data('uid');
			}
		}).promise().done( function () {
			if (uid.length > 5) {
				callback(true, uid, id);
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

	_showWindow: function (id) {
		$('#chat-app #active-chat-windows').addClass('active');
		$('#chat-app #chat-view #active-chat-windows .private-chat-window[data-id="' + id +'"]').show();
		barC.showWindow(id);
	},

	_hideWindow : function (uid) {
		$('#chat-app #chat-view #active-chat-windows .private-chat-window[data-uid="' + uid +'"]').hide();
	},

	createWindow : function (user, callback) {
		var template       = 'templates/chat-individual/private-chat-window.html',
			$chatContainer = $('#chat-app #chat-view #active-chat-windows'),
			_this = this;

		$('#chat-app #active-chat-windows').addClass('active');
		this.renderPrivateWindow($chatContainer, user, function (response) {
			_this.addBarUser(user);
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

		this._checkWindowByUser(user, function (found, uid, id) {
			if (!found) {
				_this._createConnection('newconection', user, function (response) {
					if (response.relation_id) {
						user.relation_id = response.relation_id;
						_this.createWindow(user);
					}
				});
			} else {
				_this._showWindow(id);
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
			if (response.uid) {
				_this._checkWindowByUserId(response.id_user, function (found, container) {
					if (found) {
						contact = _this._constructIncomingMessage(response, response);
						_this.renderIncomingMessage(response);
						if (!_this._isOpen(container))
							_this._showWindow(response.sender_id);
					} else {
						contact = _this._constructIncomingMessage(response, response);
						_this.createWindow(contact, function (response) {
							if (response)
								_this.renderIncomingMessage(contact);
						});
					}
				});
			}
		});
	},
	_constructIncomingMessage: function (user, data) {
		user.message     = data.message;
		user.relation_id = data.uid || data.relation_id;
		user.isme        = 'notme';

		return user;
	},

	_constructMessage: function (uid, message, callback) {
		var _this = this;
		
		this._getContactByUid(uid, function (user) {
			if (user) {
				user.nickname = _this.model.nickname;
				user.message  = message;
				user.uid      = uid;
				user.isme     = "isme";
				callback(user);
			} else {
				callback(false);
			}
		});
	},

	_cleanContainer: function (container) {
		if (container)
			container.find('#messagechat').val('');
	},

	sendMessage: function (uid, message, messagetype) {
		var _this = this,
			messagetype  = messagetype ? messagetype : 'chatmessage';

		this._constructMessage(uid, message, function (new_message) {
			_this.model.broadcastMessage(messagetype, new_message, function (messagepacket) {
				if (messagepacket) {
					messagepacket.isme = 'isme';
					_this.renderPrivateMessage(messagepacket);
				}
			});	
		});
	},

	_isValidURL: function (URL) {
    	return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(URL);
	},

	sendURL : function (uid, URL) {
		if (this._isValidURL(URL)) {
			this.sendMessage(uid, URL, "chatmessageurl", function (response) {
				this._cleanContainer();
			});
		}
	},

	sendPhoto : function (uid, photoURL) {
		var _this = this;
		if (this._isValidURL(photoURL)) {
			this.sendMessage(uid, photoURL, "chatmessageimg", function (response) {
				_this._cleanContainer();
				if (response.imageError) {
					_this.renderErrorMessage({'message': 'Formato de imagen no soportado'});
				}
			});
		}
	},

	addBarUser : function (user) {
		barC.addUser(user);
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

	append: function (template, idSection, data, callback) {
		var _this = this;

		this.templateManager.getView(template, function (response) {
			if (response) {
				_this.templateManager.$appendView(response, idSection, data);
				if (callback)
					callback(true);
			}
		});
	},

	renderIncomingMessage: function (packet) {
		var _this = this,
			template = "templates/chat-individual/user-message.html";

		this._checkWindowByUserId(packet.id_user, function (flag, container) {
			if (flag) {
				_this._cleanContainer(container);
				container = container.find('#chat-container-private');
				_this.templateManager.getView(template, function (response) {
					if (response) {
						_this.templateManager.$appendView(response, container, packet);
						container.animate({ scrollTop: container.height() }, 'slow');
					}
				});
			}
		});
	},

	renderPrivateMessage: function (packet) {
		var _this = this,
			template = "templates/chat-individual/user-message.html";

		this._checkWindowByUid(packet.uid, function (flag, container) {
			_this._cleanContainer(container);

			container = container.find('#chat-container-private');
			_this.templateManager.getView(template, function (response) {
				if (response) {
					_this.templateManager.$appendView(response, container, packet);
					container.animate({ scrollTop: container.height() }, 'slow');	
				}
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