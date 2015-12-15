var Menu = function(queryString, objParams) {
	var self = this;

	if(!Menu.createdCover) {
		var cover = document.createElement('div');
		cover.classList.add('context_menu-cover');
		cover.classList.add('context_menu-cover-hidden');

		cover.addEventListener('click', function() {
			document.querySelector('.context_menu')
				.parentElement
				.removeChild(document.querySelector('.context_menu'));
			this.classList.add('context_menu-cover-hidden')
		});

		document.body.appendChild(cover);
		Menu.createdCover = true;
	}

	this.params = objParams;
	if(typeof self.params === 'function') {
		Object.defineProperty(this, 'params', {
			get: function() {
				return objParams();
			}
		})
	}

	this.getParamsArr = function(params) {
		var paramsArr = [];
		for(var key in params) {
			paramsArr.push({title: key, handler: params[key]})
		}

		return paramsArr;
	}

	this.makeDiv = function(itemsParams, templateQueryString, CSSClass, additionalParams) {
		var paramsArr = self.getParamsArr(itemsParams);

		var templateHTML = document.querySelector(templateQueryString).innerHTML;
		var template = Handlebars.compile(templateHTML);

		additionalParams = additionalParams || {};
		additionalParams.items = paramsArr

		var HTML = template(additionalParams);
		var div = document.createElement('div');

		div.classList.add(CSSClass);
		div.innerHTML = HTML;

		return div;
	}

	this.makeContextMenu = function(params) {
		var contextMenu = self.makeDiv(params, '#menu_template', 'context_menu');
		var paramsArr = self.getParamsArr(params);

		var removeContextMenu = function() {
			contextMenu.parentElement.removeChild(contextMenu);
			document.querySelector('.context_menu-cover').classList.add('context_menu-cover-hidden');
		}

		contextMenu.removeContextMenu = removeContextMenu;

		function onNextLevelMenuClick(nextLevelItem, nextLevelIndex, nextLevelParamsArr) {
			nextLevelItem.addEventListener('click', function(ev) {
				ev.removeContextMenu = removeContextMenu;
				if(typeof nextLevelParamsArr[nextLevelIndex].handler === 'function') {
					nextLevelParamsArr[nextLevelIndex].handler(ev);
				}
			})
		}


		function onContextMenuClick(item, index) {
			item.addEventListener('click', function(ev) {
				ev.removeContextMenu = removeContextMenu;
				
				if(typeof paramsArr[index].handler === 'object' || typeof paramsArr[index].handler(ev) === 'object') {
					if(typeof paramsArr[index].handler === 'function') {
						paramsArr[index].handler = paramsArr[index].handler();
					}
					var nextLevelParamsArr = self.getParamsArr(paramsArr[index].handler);
					var nextLevel = self.makeDiv(
						paramsArr[index].handler,
						'#menu_template-next_level',
						'context_menu-next_level',
						{header: paramsArr[index].title}
					);

					nextLevel.querySelector('.context_menu-next_level-back_header-header').addEventListener('click', function() {
						contextMenu.removeChild(nextLevel)
					})

					for(var nextLevelIndex = 0; nextLevelIndex < nextLevel.querySelectorAll('.context_menu-item').length; nextLevelIndex++) {
						var nextLevelItem = nextLevel.querySelectorAll('.context_menu-item')[nextLevelIndex];

						onNextLevelMenuClick(nextLevelItem, nextLevelIndex, nextLevelParamsArr);
					}

					contextMenu.appendChild(nextLevel);
				} else if(typeof paramsArr[index].handler === 'function') {
					paramsArr[index].handler(ev);
				}
			})
		}

		for(var index = 0; index < contextMenu.querySelectorAll('.context_menu-item').length; index++) {

			var item = contextMenu.querySelectorAll('.context_menu-item')[index];

			if(!paramsArr[index].handler) return;

			onContextMenuClick(item, index);
		}

		return contextMenu;
	}
	
	Object.defineProperty(this, 'el', {
		get: function() {
			return document.querySelector(queryString);
		}
	});
	
	document.addEventListener('click', function(ev) {
		if([].indexOf.call(document.querySelectorAll(queryString), ev.target) === -1) return;

		[].forEach.call(document.querySelectorAll('.context_menu'), function(el) {
			el.parentElement.removeChild(el);
		})

		document.querySelector('.context_menu-cover').classList.remove('context_menu-cover-hidden');

		var div = self.makeContextMenu(self.params)
		var coords = ev.target.getBoundingClientRect();
		document.querySelector('#app').appendChild(div);
		div.style.left = coords.left + ev.target.offsetWidth/2 - div.offsetWidth/2 + 'px';
		div.style.top = coords.bottom + 'px';

		div.querySelector('.context_menu-arrow-gray').style.left = div.getBoundingClientRect().left + div.offsetWidth / 2 - 9 + 'px';
		div.querySelector('.context_menu-arrow-white').style.left = div.getBoundingClientRect().left + div.offsetWidth / 2 - 7 + 'px';
		if(div.getBoundingClientRect().bottom > document.body.getBoundingClientRect().bottom) {
			div.classList.add('flip')
			div.style.top = coords.top - div.offsetHeight - 0.5*16 + 'px';
			div.querySelector('.context_menu-arrow-gray').style.top = div.getBoundingClientRect().bottom - 2 + 'px';
			div.querySelector('.context_menu-arrow-white').style.top = div.getBoundingClientRect().bottom - 3 + 'px';
		} else {
			div.querySelector('.context_menu-arrow-gray').style.top = div.getBoundingClientRect().top - 9 + 'px';
			div.querySelector('.context_menu-arrow-white').style.top = div.getBoundingClientRect().top - 6 + 'px';
		}
		if(div.offsetHeight >= 16*10) {
			div.style.overflow = 'auto';
		}

		div.target = ev.target;
		ev.preventDefault();
	});
};