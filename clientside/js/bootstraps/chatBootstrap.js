$(document).foundation();
chatC = new chatController();

chatC.setModel(new chatModel());
chatC.setTemplateManager(JPLoad);

//When the user hit the enter key
$('#chat-app').on('keydown', "#message", function (e) {
	var key = e.which;
	if (key == 13) {
		$('#chat-app #send-message').click();
		return false;  
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