registerC = new registerController();

registerC.setModel(new registerModel());
registerC.setTemplateManager(JPLoad);

var errorContainer = '#chat-app #register .error-message';

$('#chat-app').on('focusout', '#register .input-text', function (e) {
	var $clickedEl = $(e.target),
		campoId = $clickedEl.attr('id');

	if ($clickedEl.val().length < 5) {
		$clickedEl.addClass('error');
		registerC.displayError("Ningun campo debe estar vacío", errorContainer);
	} else {
		$(errorContainer).empty();

		$clickedEl.removeClass('error');
		
		registerC.validate(campoId, $clickedEl.val(), function (error, info, response) {
			if (error) {
				registerC.displayError(response.message, errorContainer);
				$clickedEl.addClass('error');
			} else if (info) {
				registerC.displayInfo(response.message, errorContainer);
			} else {
				if (campoId == 'pass' || campoId == 'passconfirma') {
					$('#chat-app #register #pass').removeClass("error");
					$('#chat-app #register #passconfirma').removeClass("error");
				}
			}
		});
	}
});

$('#chat-app').on('click', '#register #register-submit', function (e) {
	var data = {};
	registerC.validateAll(function (error) {
		if (error) {
			registerC.displayError("Algo esta mal, por favor valida", errorContainer);
		} else {
			registerC.tryRegister(function (response) {
				if (response) {
					registerC._tryUpload(function (upload) {
						if (upload) {
							confirmationC = new confirmationController();
							confirmationC.setTemplateManager(JPLoad);
							confirmationC.render();
						} else {
							registerC.displayError("Algo salio mal, por favor, intenta mas tarde.", errorContainer);		
						}
					});
				} else {
					registerC.displayError("Algo salio mal, por favor, intenta mas tarde.", errorContainer);
				}
			});
		}
	});
});