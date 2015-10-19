loginC = new loginController();

loginC.setModel(new loginModel());
loginC.setTemplateManager(JPLoad);

var loginErrorContainer = '#chat-app #login .error-message';
//When the user hit the enter key
$('#chat-app').on('keydown', "#login", function (e) {
	var key = e.which;
	if (key == 13) {
		$('#chat-app #login-submit').click();
		return false;  
	}
});  

//When the user click on the submit button
$('#chat-app').on('click', '#login-submit', function (e) {
	var $clickEl = $(this),
		$user = $("#login #username"),
		$pass = $("#login #safeword");

	$clickEl.attr('disabled');
	if ($user.val().length < 3) {
		$user.addClass('error');
		return;
	} else
		$user.removeClass('error');

	if ($pass.val().length < 3) {
		$pass.addClass('error');
		return;
	} else
		$pass.removeClass('error');
	
	loginC.tryLogin($user.val(), $pass.val(), function (error, info, response, flag) {
		if (!flag) {
			if (error) {
				loginC.displayError(response.message, loginErrorContainer);
			} else if (info) {
				loginC.displayInfo(response.message, loginErrorContainer);
			}
			setTimeout(function () {
				$clickEl.removeAttr('disabled');
			},1000);
		} else {
			chatWC.setUser(loginC.getUser());
			chatC.loadChat(loginC.getUser(), function (response) {
				mainC._setLocalStorage(loginC.getUser());
				if (response) {
					$('body').addClass('chat-active');
					chatC.messageListener();
					chatC.newUserListener();
				}
			});
		}
	});
});