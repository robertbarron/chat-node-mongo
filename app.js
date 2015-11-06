var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	busboy = require('connect-busboy'),
	fs = require('fs'),

	path = require('path'),
	server = require('http').createServer(app),
	io = require('socket.io').listen(process.env.PORT || 5000),
	mongoose = require('mongoose'),
	striptags = require('striptags'),

    User = require('./serverside/dbfiles/user_model' ),
    // connStr = 'mongodb://localhost:27017/chat-interno';
    connStr = 'mongodb://herokuuser:herokupass@ds049864.mongolab.com:49864/heroku_2j38cs9s',
	utils = require('./serverside/utilities/utilities'),
	uuid = require('node-uuid'),
	userList = [],
	MAX_TRIES = 5,
	EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif'];
	
/* MONGO & MOONGOSE CONNECTION */	
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log("Successfully connected to MongoDB");
});


/* PARSEADOR DE REQUESTS */
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());

app.use(busboy());

/* SERVER STATIC REPOSITORIES */
app.use('/user_images', express.static('clientside/user_images/') );
app.use('/static', express.static('clientside/js/') );
app.use('/templates', express.static('clientside/templates/') );
app.use('/css', express.static('clientside/css/') );
app.use('/cssimages', express.static('clientside/cssimages/') );
app.use('/vendors', express.static('clientside/vendors') );
app.use('/foundation', express.static('node_modules/zurb-foundation-npm') );

/* ROUTES */
app.get('/', function(req, res) {
	res.sendFile(path.resolve('clientside/index.html'));
});
app.get('/register', function(req, res) {
	res.sendFile(path.resolve('clientside/index.html'));
});
/* API */
	/* test if username is already taken*/
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
	/* test if nick is already taken*/
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
	/* test if email account is already taken*/
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

	/* upload profile pick */
app.post('/tryupload/*', function(req, res) {
	var fstream,
		url = (req.originalUrl).split('/'),
		user = url[url.length-1];
	
	User.findOne({ 'username': user}, function (err, query) {
		if (err) {
			utils.responseJSON(res, {'error': true});
			throw err;
		}
		if (query == null) {
			utils.responseJSON(res, {'error': true});
		} else {
		    req.pipe(req.busboy);
		    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
		    	var filename = query._id + "." + utils.getExtension(mimetype),
		    		filepath = 'clientside/user_images/' + filename;

		    	if ( utils.inSearch(EXTENSIONS, utils.getExtension(mimetype)) ) {
			        fstream = fs.createWriteStream(filepath);
			        file.pipe(fstream);
			        fstream.on('close', function () {
			        	query.imageUrl = filename;
			        	query.save(function (err) {
			        		if (err) {
			        			utils.responseJSON(res, {'error' : true });
			        			throw err;
			        		} else
			        			utils.responseJSON(res, {'imageSaved' : true, 'picture' : filename });
			        	});
			        });
			    } else {
			    	utils.responseJSON(res, {'extension' : true });
			    }
		    });
		}
	});
});

	/* tries to register a user */
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
	/* Try to login a user */
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
				user.blocked = user.blocked || false;
				user.tries = user.blocked || 0;
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

	/* Try to login a saved user */
app.get('/saveduser', function (req, res) {
	var data = req.query;
	User.findOne({ $and : [{_id: data.id_user}, {nickname: data.nickname}, {email: data.email}, {phone: data.phone}] }, function (err, savedUser) {
		if (err) {
			utils.responseJSON(res, {'error': true});
			throw err;
		}
		if (savedUser == null) {
		    utils.responseJSON(res, {'notfound': true});
		} else {
			savedUser = utils.formatLogin(savedUser);
			savedUser.save( function (err) {
				if (err) {
					utils.responseJSON(res, {'error': true});
					throw err;
				}
		    	utils.responseJSON(res, {
		    		'logged' : true, 
		    		'user'   : utils.responseLogin(savedUser)
		    	});
		    });
		}
	});
});

/* SOCKET COMMUNICATION */
io.sockets.on('connection', function (socket) {
/* MAIN EVENTS */
	socket.on('message', function (data) {
		data.message = striptags(data.message);
		io.sockets.emit("newmessage", data);
	});

	socket.on('messageurl', function (data) {
		data.message = '<a href="' + data.message + '" target="_blank">' + data.message + '</a>';
		data.message = striptags(data.message, "<a>");
		
		io.sockets.emit("newmessage", data);
	});

	socket.on('messageimg', function (data, callback) {
		data.message = data.message.toLowerCase();
		if ( utils.inSearch(EXTENSIONS, data.message) ) {
			data.message = '<img src="' + data.message + '" width="200">';
			data.message = striptags(data.message, "<img>");
			data.message = '<div class="image-container">' + data.message + '<div class="close-img">&times;</div></div>';
			
			io.sockets.emit("newmessage", data);
		} else
			callback({'imageError' : true });
	});


	socket.on('userlogin', function (data, callback) {
		User.findOne({'nickname' : data.nickname}, function (err, user) {
			if (user != null) {
				user = utils.trackSocket(user, socket);
				user.save(function (err) {
					if (err) {
						utils.responseJSON(res, {'error': true});
						throw err;
					} else {
						User.find({'logged' : true}, function (err, query) {
							utils.addUser(query, data, socket, function (response) {
								response.userlist = response;
								io.sockets.emit("listupdate", response.userlist);
							});
						});
					}
				});
			}
		});
	});

	socket.on('disconnect', function() {
		User.findOne({'socket_id' : socket.id}, function (err, user) {
			if (user != null) {
				user = utils.formatDisconnect(user);
				user.save( function (err) {
					if (err) {
						utils.responseJSON(res, {'error': true});
						throw err;
					}
					// User.find({'logged' : true}, function (err, users) {
					User.find({'logged' : true}, null, {sort: {'username': 1} }, function (err, users) {
						if (err) {
							utils.responseJSON(res, {'error': true});
							throw err;
						}
						utils.addUser(users, user, socket, function (response) {
							response.userlist = response;
							io.sockets.emit("listupdate", response.userlist);
						});
					});
				});
			}
		});
   	});

   	// ---------------------------------------------------------------
/* INDIVIDUAL CHATS EVENTS */

   	socket.on('newconection', function (data, callback) {
   		var newData = {};

		data.receiver_id  = data.id_user;
		data.nickname     = data.nickname;
		data.relation_id  = uuid.v4();
		data.socket_id    = socket.id;
		callback(data);
		User.findOne({'_id' : data.id_user}, function (err, user) {
			if (user != null) {
				socket.broadcast.to(user.socket_id).emit('chatconnection', data);
			}
		});
	});
   	/* private chat message */
	socket.on('chatmessage', function (data, callback) {
		data.message = striptags(data.message);
		User.findOne({'_id' : data.id_user}, function (err, user) {
			if (err)
				throw err;
			if (user != null) {
				data.id_user  = data.sender_id;
				socket.broadcast.to(user.socket_id).emit('chatnewmessage', data);
				callback(data);
			}
		});
	});

	/* private chat message URL*/
	socket.on('chatmessageurl', function (data, callback) {
		data.message = '<a href="' + data.message + '" target="_blank">' + data.message + '</a>';
		data.message = striptags(data.message, "<a>");

		User.findOne({'_id' : data.id_user}, function (err, user) {
			if (err)
				throw err;
			if (user != null) {
				data.id_user  = data.sender_id;
				socket.broadcast.to(user.socket_id).emit('chatnewmessage', data);
				callback(data);
			}
		});
	});

	/* private chat message PHOTO*/
	socket.on('chatmessageimg', function (data, callback) {
		data.message = data.message.toLowerCase();
		if ( utils.inSearch(EXTENSIONS, data.message) ) {
			data.message = '<img src="' + data.message + '" width="150">';
			data.message = striptags(data.message, "<img>");
			data.message = '<div class="image-container">' + data.message + '<div class="close-img">&times;</div></div>';
			User.findOne({'_id' : data.id_user}, function (err, user) {
				if (err)
					throw err;
				if (user != null) {
					data.id_user  = data.sender_id;
					socket.broadcast.to(user.socket_id).emit('chatnewmessage', data);
					callback(data);
				}
			});
		} else
			callback({'imageError' : true });
	});
});

server.listen(3000);