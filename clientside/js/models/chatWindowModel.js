var chatWindowModel = function () {
	this.id_user;
	this.nickname;
	this.socket = io();
	this.connections = [];
};

chatWindowModel.prototype = {
	constructor: chatWindowModel,

	setUser : function (user) {
		this.id_user = user.id_user;
		this.nickname = user.nickname;
		console.log("setUser");
	},
	
	getUser : function (callback) {
		callback({'id_user' : this.id_user, 'nickname' : this.nickname});
	},

	getRelationUser: function (uid, callback) {
		var _this = this,
			flag = false,
			vuelta = 0;
			user =  null;

		if (this.connections.length > 0) {
			$.each(this.connections, function (index, item) {
				if (item.uid == uid) {
					flag = true;
					user = item;
				}
				if (index >= _this.connections.length)
					flag = true;
			});
		} else {
			callback(false, false);
		}
		var waitForIt = function () {
			setTimeout(function () {
				if (flag) {
					if (user != null)
						callback(true, user);
					else
						callback(false, false);
				} else {
					waitForIt();
				}
			}, 50);
		};
		waitForIt();
	},

	emitMessage : function (socket, messagetype, data, callback) {
		messagetype  = messagetype ? messagetype : "chatmessage";

		socket.emit(messagetype, data, function (response) {
			callback(response);
		});
	},

	broadcastMessage : function (messagetype, data, callback) {
		var _this = this;

		data.sender_id = this.id_user;
		data.receiver_id = data.id_user;
		messagetype  = messagetype ? messagetype : "chatmessage";

		this.socket.emit(messagetype, data, function (response) {
			_this.addConnection(response);
			callback(response);
		});
	},

	addConnection : function (connection) {
		this.connections.push({
			'uid'        : connection.relation_id, 
			'id_pal' : connection.sender_id,
			'nickname'   : connection.nickname,
		});
	},

	listenConnection : function (callback) {
		this.socket.on("chatconnection", function (data) {
			callback(data);
		});
	},

	listenNewMessage: function (callback) {
		this.socket.on("chatnewmessage", function (data) {
			callback(data);
		});
	}
};
