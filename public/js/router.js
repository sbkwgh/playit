var Router = function(templateContainer, menuBar) {
	var self = this;

	this.menuBar = menuBar;
	this.routes = {};
	this.templateContainer = templateContainer;
	
	
	['load', 'hashchange'].forEach(function(event) {
		window.addEventListener(event, function() {
			var hash =  location.hash.slice(1);
			var routeHandler;
			if(hash.slice(-1) === '/') hash = hash.slice(0, -1);

			if(hash.trim() === '') hash = 'index';

			routeHandler = self.getRouteHandlerFromRoute(hash);
			var template = document.querySelector('script[data-template="' + (routeHandler || {}).templateName + '"]');

			if(!hash || !routeHandler || !template) {
				self.templateContainer.innerHTML = '404';
			} else {
				routeHandler.handler(self.templateContainer, template.innerHTML, routeHandler.params);
			}
		})
	});

	this.change = function(templateName) {
		location.hash = templateName;
	}

	this.addRoute = function(route, cb) {
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
				subRoute[routeSegment] = cb;
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
			
			if(i === routeSegments.length-1 && typeof subRoutes === 'function') {
				return {
					handler: subRoutes,
					templateName: templateName.slice(0, -1),
					params: returnSegments
				};
			}
		}
	}
};