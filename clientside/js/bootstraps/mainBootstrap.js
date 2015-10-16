mainC = new mainController();

$().ready(function () {
	var hash = document.URL.split("/"),
		path = hash[hash.length-1];
		
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