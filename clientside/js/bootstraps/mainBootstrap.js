$().ready(function () {
	var hash = document.URL.split("/"),
		path = hash[hash.length-1],
		mainC = new mainController(),
		chatC = new chatController(),
		loginC= new loginController();
	
	loginC.setModel(new loginModel());
	loginC.setTemplateManager(JPLoad);

	chatC.setModel(new loginModel());
	chatC.setTemplateManager(JPLoad);

	switch (path) {
		case "register" :
			registerC.loadRegister();
			break;
		default:
			mainC._checkStatus( function (response) {
				if (!response.supported) {
					loginC.loadLogin();
				} else {
					mainC.loadLocalUser(chatC, loginC);
				}
			});
			break;
	}
});