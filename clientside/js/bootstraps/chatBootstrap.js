chatC = new chatController();

chatC.setModel(new chatModel());
chatC.setTemplateManager(JPLoad);

//When the user hit the enter key
$('#chat-app').on('keydown', "#comments-container #message", function (e) {
	var key = e.which;
	if (key == 13) {
		if (e.shiftKey) {
        	e.preventDefault();
        	$(this).val( $(this).val() + '\n');
    	} else {
			$('#chat-app #send-message').click();
			return false;
		}
	}
});  

//When the user click on the submit button
$('#chat-app').on('click', '#comments-container #send-message', function (e) {
	var $message = $("#chat-view #message");

	if ($message.val().length < 2) {
		return;
	} else {
		if ($message.val().length > 300) {
			$message.val('');
			$message.addClass("error");
		} else {
			$message.removeClass("error");
			chatC.sendMessage($message.val());
		}
	}
});

//When the user clic on an close image
$('#chat-app').on('click', "#chat-view #chat-container .user-message-normal .close-img", function (e) {
	var $click = $(this);

	$click.closest('.user-message-normal').remove();
});  

// click on the menu
$('#chat-app').on('click', '#nav-toggle', function (e) {
	var click = $(this),
		privateWindows = $('#chat-app #user-bar'),
		chatContaner = $('#chat-app .comments-container');
	if ($(this).hasClass("active") ) {
		$(this).removeClass("active");
		privateWindows.removeClass("open");
		chatContaner.addClass("large-10").removeClass("large-8");
	}
	else {
		$(this).addClass("active");
		privateWindows.addClass("open");
		chatContaner.addClass("large-8").removeClass("large-10");
	}
});

// click on the user list active toggle (only mobile)
$('#chat-app').on('click', '#comments-container #users-bar-toggle', function (e) {
	var click = $(this),
		privateWindows = $('#chat-app #users-container'),
		chatContaner = $('#chat-app .comments-container');

	privateWindows.addClass("open");
	chatContaner.removeClass("large-10").addClass("large-8");
});

// click inside the user list active toogle (only mobile)
$('#chat-app').on('click', '#users-container #users-list-toggle', function (e) {
	var privateWindows = $('#chat-app #users-container'),
		chatContaner = $('#chat-app .comments-container');

	privateWindows.removeClass("open");
	chatContaner.addClass("large-10").removeClass("large-8");
});

// click inside the bar toogle (only mobile)
$('#chat-app').on('click', '#bar-toggle', function (e) {
	var privateWindows = $('#chat-app #user-bar'),
		chatContaner = $('#chat-app .comments-container');

	privateWindows.removeClass("open");
	chatContaner.removeClass("large-10").addClass("large-8");

	var nav = $('#chat-app #nav-toggle');
	nav.removeClass('active');
});

//send url
$('#chat-app').on('click', '#comments-container #send-url', function (e) {
	var linkUrl = prompt('Escribe o pega el link que quieres enviar');
	if (linkUrl.length > 5)
		chatC.sendURL(linkUrl);
});

//send photo
$('#chat-app').on('click', '#comments-container #send-photo', function (e) {
	var photoUrl = prompt('Escribe o pega la url de la imagen que quieres enviar');
	if (photoUrl.length > 5)
		chatC.sendPhoto(photoUrl);
});

//click on an active user
$('#chat-app').on('click', '#chat-view #chat-users .user', function (e) {
	var click    = $(this);
	
	if (!click.hasClass('me-class') ) {
		chatWC.newConnection(chatWC.getContactInfo(click));
		$('#users-container #users-list-toggle').click();
	}
		// chatWC.newConnection(userObj);
});