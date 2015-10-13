chatC = new chatController();

chatC.setModel(new chatModel());
chatC.setTemplateManager(JPLoad);

//When the user hit the enter key
$('#chat-app').on('keydown', "#message", function (e) {
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
$('#chat-app').on('click', '#send-message', function (e) {
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

// click on the menu
$('#chat-app').on('click', '#nav-toggle', function (e) {
	var click = $(this),
		privateWindows = $('#chat-app #private-container'),
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

//click on an active user
$('#chat-app').on('click', '#chat-view #chat-users .user', function (e) {
	var click    = $(this),
		idUser   = click.data('id'),
		nickName = click.find('.nickname').data('nickname'),
		imgUrl   = click.find('.user-profile img').attr('src'),
		obj = {};
	obj.id_user = idUser;
	obj.nickname = nickName;
	obj.imageUrl = imgUrl;
	obj.phone = "6441430071";
	obj.email = "rbarron@mx1.ibm.com";
	if (!click.hasClass('me-class') ) {
		$('#active-chat-windows').addClass('active');
		//open new window
		chatC.templateManager.getView("templates/private-chat-window.html", function (response) {
			if (response)
				chatC.templateManager.$loadView(response, $('#chat-app #chat-view #active-chat-windows'),obj);
		});
	}
});