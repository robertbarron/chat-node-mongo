$().ready(function () {
	var hash = document.URL.split("/");
	switch (hash[hash.length-1]) {
		case "register" :
			registerC.loadRegister();
			break;
		default:
			loginC.loadLogin();
			break;
	}
});