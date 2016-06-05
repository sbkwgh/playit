var confirmBox = function (message, cb, okColour) {
	var confirmBoxDiv = document.createElement('div');
	var template = document.querySelector('script[data-template="confirm-box"]').innerHTML;

	confirmBoxDiv.classList.add('confirm');
	confirmBoxDiv.innerHTML = Handlebars.compile(template)({'message': message, 'okColour': okColour});

	console.log(confirmBoxDiv)

	confirmBoxDiv.close = function() {
		confirmBoxDiv.classList.add('confirm-close');

		setTimeout(function() {
			document.body.removeChild(confirmBoxDiv);
		}, 200)
	}

	confirmBoxDiv.querySelector('#confirm-button-ok').addEventListener('click', function() {
		cb(true);
		confirmBoxDiv.close();
	});
	confirmBoxDiv.querySelector('#confirm-button-cancel').addEventListener('click', function() {
		cb(false);
		confirmBoxDiv.close();
	});

	if(document.querySelector('.confirm')) {
		document.body.removeChild(document.querySelector('.confirm'));
	}
	document.body.appendChild(confirmBoxDiv);
}