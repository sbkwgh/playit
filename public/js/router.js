var Router = function(templateContainer) {
	var self = this;

	this.routes = {};
	this.templateContainer = templateContainer;

	
	['load', 'hashchange'].forEach(function(event) {
		window.addEventListener(event, function() {
			var hash =  location.hash.slice(1);
			var routeHandler;

			if(hash.slice(-1) === '/') hash = hash.slice(0, -1);

			var link = document.querySelector('.menu-menu_item[data-url="' + hash + '"]');

			if(hash.trim() === '') hash = 'index';

			var selected = document.querySelector('.menu-menu_item_selected');
			if(selected) {
				selected.classList.remove('menu-menu_item_selected');
			}
			if(link) {
				link.classList.add('menu-menu_item_selected');
			}

			routeHandler = self.getRouteHandlerFromRoute(hash);
			var template = document.querySelector('script[data-template="' + (routeHandler || {}).templateName + '"]');

			ga('send', 'pageview', '/' + hash);

			if(!hash || !routeHandler || !template) {
				if(hash[0] === '/') hash = hash.slice(1);
				location.hash = '404/' + hash;
			} else {
				if(routeHandler.handler.onLoad && event === 'load') {
					routeHandler.handler.onLoad(function() {
						routeHandler.handler.allEvents(self.templateContainer, template.innerHTML, routeHandler.params);
					}, self.templateContainer, template.innerHTML, routeHandler.params);
				} else {
					routeHandler.handler.allEvents(self.templateContainer, template.innerHTML, routeHandler.params);
				}
			}
		})
	});

	this.change = function(templateName) {
		location.hash = templateName;
	}

	this.addRoute = function(route, allEvents, onLoad) {
		var routeSegments;
		var routeSegment;
		var subRoute = this.routes;

		if(route[0] === '/') {
			route = route.slice(1)
		}

		routeSegments = route.split('/');

		for(var i = 0; i < routeSegments.length; i++) {
			routeSegment = routeSegments[i];
			if(!subRoute[routeSegment]) {
				subRoute[routeSegment] = {};
			}

			if(i === routeSegments.length-1) {
				subRoute[routeSegment] = {
					allEvents: allEvents,
					onLoad: onLoad
				};
			}

			subRoute = subRoute[routeSegment];
		}
	};

	this.getRouteHandlerFromRoute = function(route) {
		var routeSegments = route.split('/');
		var templateName = ''
		var subRoutes = this.routes;
		var routeSegment;
		var returnSegments = {};

		self.templateName = '';

		for(var i = 0; i < routeSegments.length; i++) {
			
			for(routeSegment in subRoutes) {
				if(routeSegment[0] === ':') {
					returnSegments[routeSegment.slice(1)] = routeSegments[i];
					subRoutes = subRoutes[routeSegment]
					templateName += routeSegment + '/'
					break;
				} else if(routeSegment === routeSegments[i]) {
					subRoutes = subRoutes[routeSegment]
					templateName += routeSegment + 	'/'
					break;
				}
			}
			
			if(i === routeSegments.length-1 && typeof subRoutes['allEvents'] === 'function') {
				return {
					handler: {
						onLoad: subRoutes.onLoad,
						allEvents: subRoutes.allEvents
					},
					templateName: templateName.slice(0, -1),
					params: returnSegments
				};
			}
		}
	}
};