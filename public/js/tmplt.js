function tmplt(htmlStr, data, transformations) {
	function getValue(bindingStr) {
		var str = bindingStr.split('|')[0];
		var transformationsArr = bindingStr.split('|').slice(1);

		var segments = str.split('.');
		var subData = data;

		for(var i = 0; i < segments.length; i++) {
			console.log(subData)
			console.log(bindingStr)

			if(!subData[segments[i]]) return undefined;

			subData = subData[segments[i]];
		}

		if(transformationsArr.length) {
			transformationsArr.forEach(function(transformation) {
				subData = transformations[transformation](subData);
			});
		}
		
		return subData;
	}

	var html = document.createElement('div');
	var mustacheMatches;

	html.innerHTML = htmlStr;
	
	$$(html, '*[t-repeat]').forEach(function(el) {
		var iterator = getValue(el.getAttribute('t-repeat'));

		iterator.forEach(function(item, index) {
			var iteratorData = data;
			var itemEl = document.createElement(el.nodeName);
			
			iteratorData.self = item;
			iteratorData.$index = index;
			
			itemEl.innerHTML = tmplt(el.innerHTML, iteratorData, transformations);

			[].forEach.call(el.attributes, function(attr) {
				if(attr.name !== 't-repeat') {
					itemEl.setAttribute(attr.name, attr.value)
				}
			});

			el.parentNode.insertBefore(itemEl, el.nextSibling);
		})
		el.parentElement.removeChild(el);
	});

	$$(html, '*[t-if]').forEach(function(el) {
		var value = getValue(el.getAttribute('t-if'));

		if(!value) {
			el.parentElement.removeChild(el);
		} else {
			el.removeAttribute('t-if');
		}
	});

	$$(html, '*[t-ifnot]').forEach(function(el) {
		var value = getValue(el.getAttribute('t-ifnot'));

		if(value) {
			el.parentElement.removeChild(el);
		} else {
			el.removeAttribute('t-ifnot');
		}
	});

	$$(html, '*[t-class]').forEach(function(el) {
		var pairs = el.getAttribute('t-class').replace(/\s/g, '').split(';');

		pairs.forEach(function(pair) {
			var value = getValue(pair.split(':')[1]);
			var className = pair.split(':')[0];

			if(value) {
				el.classList.add(className);
			}
		});

		el.removeAttribute('t-class');
	});

	return html.innerHTML.replace(/{{[a-z0-9\.\|]+}}/gi, function(match) {
		return getValue(match.slice(2, -2));
	});
}

tmplt.new = function(htmlStr, transformations) {
	return function(data) {
		return tmplt(htmlStr, data, transformations);
	}
}