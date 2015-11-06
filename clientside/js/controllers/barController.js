//barController.js
var barController = function () {
	this.templateManager;
};

barController.prototype = {
	constructor: barController,
	
	setTemplateManager : function (templateManager) {
		this.templateManager = templateManager;
	},

	showWindow : function (id, flag) {
		var $component = $('#chat-app #chat-view #user-bar #bar .user[data-uid="' + id +'"]');
		$component.addClass("active");
		if (flag)
			chatWC._showWindow(id);
	},

	hideWindow: function (uid, flag) {
		var $component = $('#chat-app #chat-view #user-bar #bar .user[data-uid="' + uid +'"]');

		$component.removeClass("active");
		if (flag)
			chatWC._hideWindow(uid);
	},

	animate: function (id) {
		$('#chat-app #chat-view #user-bar #bar .user[data-id="' + id +'"]').addClass('animate');
		setTimeout(function () {
			$('#chat-app #chat-view #user-bar #bar .user[data-id="' + id +'"]').removeClass('animate');
		},200);
	},

	pending: function (id) {
		$('#chat-app #chat-view #user-bar #bar .user[data-id="' + id +'"]').addClass('pending');
	},

	viewed: function (id) {
		$('#chat-app #chat-view #user-bar #bar .user[data-id="' + id +'"]').removeClass('pending');
	},
	
	barAnimate: function () {
		$container = $('#chat-app #chat-view #user-bar');
		$container.addClass('animate');
		setTimeout(function () {
			$container.removeClass('animate');
		},500);
	},
	

	addUser: function (data) {
		var _this = this,
			template = "templates/chat-bar/chat-bar-user.html",
			$container = $('#chat-app #chat-view #user-bar #bar');

		this.templateManager.getView(template, function (response) {
			if (response) {
				_this.templateManager.$appendView(response, $container, data);
			}
		});
	},	
};