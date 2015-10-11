var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	path = require('path'),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	mongoose = require('mongoose'),
    User = require('./dbfiles/user-model'),
    connStr = 'mongodb://localhost:27017/chat-interno';
	utils = require(path.resolve('./utilities/utilities') ),
	userList = [],
	MAX_TRIES = 5;
	
/* MONGO & MOONGOSE CONNECTION */	
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log("Successfully connected to MongoDB");
});

/* PARSEADOR DE REQUESTS */
app.use(bodyParser());

/* SERVER STATIC REPOSITORIES */
app.use('/static', express.static('../clientside/js/') );
app.use('/templates', express.static('../clientside/templates/') );
app.use('/css', express.static('../clientside/css/') );
app.use('/vendors', express.static('../clientside/vendors') );
app.use('/foundation', express.static('../node_modules/zurb-foundation-npm') );
app.use('/api', express.static('../clientside/data') );

/* ROUTES */
app.get('/', function(req, res) {
	res.sendFile(path.resolve('../clientside/index.html'));
});
app.get('/register', function(req, res) {
	res.sendFile(path.resolve('../clientside/index.html'));
});
/* API */
app.get('/tryuser', function(req, res) {
	var username = req.query.username;

	User.findOne({'username' : username}, function (err, user) {

	    if (err) throw err;
	    if (user == null)
	    	utils.responseJSON(res, {'exists': false});
	    else
	    	utils.responseJSON(res, {'exists': true});
	});
});
app.get('/trynick', function(req, res) {
	var nickname = req.query.nickname;

	User.findOne({'nickname' : nickname}, function (err, user) {
	    if (err) throw err;
	    if (user == null)
	    	utils.responseJSON(res, {'exists': false});
	    else
	    	utils.responseJSON(res, {'exists': true});
	});
});
app.get('/trymail', function(req, res) {
	var mail = req.query.mail;

	User.findOne({'email' : mail}, function (err, user) {
	    if (err) throw err;
	    if (user == null)
	    	utils.responseJSON(res, {'exists': false});
	    else
	    	utils.responseJSON(res, {'exists': true});
	});
});
app.post('/tryregister', function(req, res) {
	var data = utils.formatRegister(req.body.data),
		newUser = new User(data);

	User.findOne( { $or: [ { username: data.username}, {nickname: data.nickname} ] }, function (err, user) {
		if (err) {
			utils.responseJSON(res, {'saved': false});
			throw err;
		}
		if (user == null) {
			newUser.save( function (err) {
		    	if (err) {
					utils.responseJSON(res, {'saved': false});
					throw err;
				}
		    	utils.responseJSON(res, {'saved': true});
			});
		} else {
			utils.responseJSON(res, {'saved': false});
		}
	});
});
app.get('/trylogin', function (req, res) {
	var data = req.query;
	User.findOne({ username: data.username}, function (err, user) {
		if (err) {
			utils.responseJSON(res, {'error': true});
			throw err;
		}
		if (user == null) {
		    utils.responseJSON(res, {'notfound': true});
		} else {
			user.comparePassword(data.clave, function (error, isMatch) {
				// Si se encuentra, y no tiene el maximo de intentos
				if (isMatch && !user.blocked && (user.tries < MAX_TRIES) ) {
					user = utils.formatLogin(user);
					user.save( function (err) {
						if (err) {
							utils.responseJSON(res, {'error': true});
							throw err;
						}
				    	utils.responseJSON(res, {
				    		'logged' : true, 
				    		'user'   : utils.responseLogin(user)
				    	});
				    });
				} else if (isMatch && user.blocked) { // Logged but blocked
					var currentDate = new Date();

					if (utils.stillBlocked(user.blockedDate, currentDate)) { //Tell is blocked
						utils.responseJSON(res, {
							'blocked' : true, 
							'hoursLeft': utils.hoursLeft(user.blockedDate, currentDate)
						});
					} else {  //Unblock and return login
						user = utils.formatLogin(user);
						user.save( function(err) {
							if (err) {
								utils.responseJSON(res, {'error': true});
								throw err;
							} else {
								utils.responseJSON(res, {
									'logged' : true, 
									'user'   : utils.responseLogin(user)
								});
							}
						});
					}
				} else if (!isMatch && !user.blocked) {
					if ( (user.tries + 1) >= MAX_TRIES) { //se debe bloquear
						user = utils.formatBlock(user);
						user.save( function(err) {
							if (err) {
								utils.responseJSON(res, {'error': true});
								throw err;
							} else {
								utils.responseJSON(res, {
									'blocked': true, 
									'hourLeft' : utils.hoursLeft(user.blockedDate, new Date() )
								});
							}
						});
					} else { // se aumenta tries
						user = utils.addTries(user);
						user.save( function(err) {
							if (err) {
								utils.responseJSON(res, {'error': true});
								throw err;
							} else {
								utils.responseJSON(res, {
									'tries' : true,
									'triesLeft': (MAX_TRIES - user.tries)
								});
							}
						});
					}
				}
			});
		}
	});
});
/* SOCKET COMMUNICATION */
io.sockets.on('connection', function (socket) {
	socket.on('message', function (data) {
		io.sockets.emit("newmessage", data);
	});

	socket.on('userlogin', function (data) {
		utils.addUser(userList, data, socket, function (response) {
			userList = response.userlist;
			io.sockets.emit("listupdate", response);
		});
	});

	socket.on('disconnect', function() {
		utils.removeUser(userList, socket.id, function (response) {
			io.sockets.emit("listupdate", response);
		});
   	});
});

server.listen(3000);