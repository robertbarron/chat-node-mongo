chatWC = new chatWindowController();

chatWC.setModel(new chatWindowModel());
chatWC.setTemplateManager(JPLoad);

chatWC.newConnectionListener();
chatWC.newMessageListener();

$('#chat-app').on('click', '#active-chat-windows .private-chat-window .icon-cancel-circled', function (e) {
	var $click = $(this);

	$click.closest('#active-chat-windows').removeClass("active");
	$click.closest('.private-chat-window').hide();
});

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
$('#chat-app').on('click', '#active-chat-windows .private-chat-window #send-message', function (e) {
	var $click = $(this),
		$message = $click.closest('.private-chat-window').find('#message'),
		uid      = $click.closest('.private-chat-window').data('uid');

	if ($message.val().length < 2) {
		return;
	} else {
		if ($message.val().length > 300) {
			$message.val('');
			$message.addClass("error");
		} else {
			$message.removeClass("error");
			chatWC.sendMessage(uid, $message.val());
		}
	}
});

//send url
$('#chat-app').on('click', '#active-chat-windows .private-chat-window #send-url', function (e) {
	var linkUrl = prompt('Escribe o pega el link que quieres enviar');
	if (linkUrl.length > 5)
		chatC.sendURL(linkUrl);
});

//send photo
$('#chat-app').on('click', '#active-chat-windows .private-chat-window #send-photo', function (e) {
	var photoUrl = prompt('Escribe o pega la url de la imagen que quieres enviar');
	if (photoUrl.length > 5)
		chatC.sendPhoto(photoUrl);
});