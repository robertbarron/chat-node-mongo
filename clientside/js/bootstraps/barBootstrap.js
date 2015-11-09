barC = new barController();
barC.setTemplateManager(JPLoad);

//bar bootstrap
$('#chat-app').on('click', '#chat-view #user-bar #bar .user', function (e) {
	var $click = $(this),
		id     = $(this).data('id'),
		uid    = $(this).data('uid');

	if ( $(this).hasClass('active') )
		barC.hideWindow(uid, true);
	else
		barC.showWindow(id, true);

	$('#chat-app #nav-toggle').click();
});