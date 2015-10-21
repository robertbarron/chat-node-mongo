var chatWindowModel = function () {
	this.id_user;
	this.nickname;
	this.socket_id;
	this.socket = io();
	this.connections = [];
};

chatWindowModel.prototype = {
	constructor: chatWindowModel,

	setUser : function (user) {
		var _this = this;
		this.id_user = user.id_user;
		this.nickname = user.nickname;
	},
	
	getUser : function (callback) {
		callback({'id_user' : this.id_user, 'nickname' : this.nickname});
	},

	emitMessage : function (socket, messagetype, data, callback) {
		messagetype  = messagetype ? messagetype : "chatmessage";

		this.socket.emit(messagetype, data, function (response) {
			callback(response);
		});
	},

	broadcastMessage : function (messagetype, data, callback) {
		var _this = this;

		data.sender_id = this.id_user;
		data.receiver_id = data.id_user;
		messagetype  = messagetype ? messagetype : "chatmessage";

		this.socket.emit(messagetype, data, function (response) {
			if (messagetype == "newconection")
				_this.addConnection(response);

			callback(response);
		});
	},

	addConnection : function (connection) {
		this.connections.push({
			'uid'        : connection.relation_id, 
			'id_pal' : connection.receiver_id,
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
