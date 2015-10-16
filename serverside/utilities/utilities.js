var utilities = exports;

utilities.addUser = function (data, userInfo, socket, callback) {
	var userlist = [];

	for (var i = 0 ; i < data.length ; i++) {
		if (userInfo.nickname == data[i].nickname) {
			userlist.push({
				"id_user"  : data[i]._id,
				"nickname" : data[i].nickname,
				"hexa"     : data[i].hexa,
				"email"    : data[i].email,
				"phone"    : data[i].phone,
				"imageUrl" : data[i].imageUrl,
				"socket_id": socket.id
			});
		} else {
			userlist.push({
				"id_user"  : data[i]._id,
				"nickname" : data[i].nickname,
				"hexa"     : data[i].hexa,
				"email"    : data[i].email,
				"phone"    : data[i].phone,
				"imageUrl" : data[i].imageUrl,
				"socket_id": socket.id
			});
		}
		if (i == (data.length - 1) ) {
			callback(userlist);
			break;
		}
	}
};

utilities.formatRegister = function (data) {
	var newData = {};
	newData = {
		"username": data.user,
		"password": data.pass,
		"nickname": data.nickname,
		"email"   : data.correo,
		"phone"   : data.telefono,
		"logged"  : false
	};
	return newData;
};

utilities.responseJSON = function (response, data) {
	response.writeHead(200, {"Content-Type": "application/json"});
  	response.end(JSON.stringify(data));
};

utilities.responseLogin = function (data) {
	var newData = {
		"id"      : data._id,
		// "username": data.username,
		"nickname": data.nickname,
		"email"   : data.email,
		"phone"   : data.phone,
		"imageUrl": data.imageUrl
	};
	return newData;
};

utilities.stillBlocked = function (blockedDate, currentDate) {
	var diff = parseInt( (currentDate.getTime() - blockedDate.getTime() ) / 3600000);
	if ( diff >= 5) {
		return false;
	} else {
		return true;
	}
};

utilities.hoursLeft = function (blockedDate, currentDate) {
	var diff = parseInt( (currentDate.getTime() - blockedDate.getTime() ) / 3600000);
	if (diff >= 5) {
		return 0;
	} else if (diff < 5) {
		return parseInt(5 - diff);
	}
};

utilities.formatLogin = function (user) {
	user.logged     = true;
	user.loggedDate = new Date();
	user.blocked    = false;
	user.tries      = 0;

	return user;
};

utilities.trackSocket = function (user, socket) {
	user.socket_id = socket.id;
	return user;
};

utilities.addTries = function (user) {
	if (user.tries) {
		user.logged     = false;
		user.blocked    = false;
		user.tries      = (user.tries + 1);
	} else {
		user.logged     = false;
		user.blocked    = false;
		user.tries      = 1;
	}
	

	return user;
};

utilities.formatBlock = function (user) {
	user.logged      = false;
	user.blockedDate = new Date();
	user.blocked     = true;
	user.tries       = 0;

	return user;
};

utilities.formatDisconnect = function (user) {
	user.logged      = false;
	user.loggedDate  = new Date(),
	user.blocked     = false;
	user.tries       = 0;
	user.socket_id   = "";

	return user;
};

utilities.getExtension = function (mime) {
	var image = mime.split("/");
	return image[image.length-1].toLowerCase();
};


utilities.addImage = function (user, name) {
	user.imageUrl = name;
	return user;
};

utilities.inSearch = function (EXT, term) {
	for (var i = 0; i < EXT.length; i++) {
		if (term.indexOf(EXT[i]) != -1) {
			return true;
			break;
		}
		if (i >= (EXT.length - 1) ){
			return false;
			break;
		}
	}
};


