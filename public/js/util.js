function $() {
	var parent, selector;

	if(typeof arguments[0] === 'string') {
		selector = arguments[0];
		return document.querySelector(selector);
	} else {
		selector = arguments[1];
		parent = arguments[0];

		return parent.querySelector(selector);
	}
}
function $$() {
	var parent, selector, els;
	var elsArr = [];

	if(typeof arguments[0] === 'string') {
		selector = arguments[0];
		els = document.querySelectorAll(selector);
	} else {
		selector = arguments[1];
		parent = arguments[0];

		els = parent.querySelectorAll(selector);
	}

	[].forEach.call(els, function(el) {
		elsArr.push(el);
	});

	return elsArr;
}