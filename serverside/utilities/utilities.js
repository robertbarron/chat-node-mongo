var utilities = exports;

utilities.addUser = function (userlist, data, socket, callback) {
	userlist.push({
		"socket_id": socket.id,
		"id_user": data.id_user,
		"nickname" : data.nickname,
		"hexa" : data.hexa
		
	});
	data.userlist = userlist;
	callback(data);
};

utilities.formatRegister = function (data) {
	var newData = {};
	newData = {
		"username": data.username,
		"password": data.pass,
		"nickname": data.nickname,
		"email": data.correo,
		"phone": data.telefono,
		"logged": false
	};
	return newData;
};
utilities.removeUser = function (data, socketid, callback) {
	callback(data.filter(function (item) {
		return item.socket_id != socketid;
	}));
};

utilities.responseJSON = function (response, data) {
	response.writeHead(200, {"Content-Type": "application/json"});
  	response.end(JSON.stringify(data));
};

utilities.responseLogin = function (data) {
	var newData = {
		"id"      : data._id,
		"username": data.username,
		"nickname": data.nickname,
		"email"   : data.email,
		"phone"   : data.phone
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

	return user;
};