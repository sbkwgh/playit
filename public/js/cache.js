var cache = function(route, cb) {
	var routeHandlerObj = routeHandlerObj = cache.getRouteHandler(route);

	var routeSegments = route.split('/');
	var subCache = cache.cache;
	var data;

	if(routeSegments[0] === '') routeSegments.shift();

	for(var i = 0; i < routeSegments.length; i++) {
		subCache = subCache[routeSegments[i]];

		if(!subCache) {
			break;
		}

		if(i === routeSegments.length-1) {
			data = subCache;
		}
	};

	if(data) {
		cb(data)
	} else {
		routeHandlerObj.handler(routeHandlerObj.params, function(data) {
			var cacheObj = cache.cache;
			for(var i = 0; i < routeSegments.length; i++) {
				if(i === routeSegments.length-1)  {
					cacheObj[routeSegments[i]] = data;
					break;
				};

				if(!cacheObj[routeSegments[i]]) {
					cacheObj[routeSegments[i]] = {}
				}
				cacheObj = cacheObj[routeSegments[i]];
			}
			cb(data);
		});
	}
}
cache.routes = {};
cache.cache = {};

cache.getRouteHandler = function(route) {
	var routeSegments = route.split('/');
	var subRoutes = cache.routes;
	var routeSegment;
	var returnSegments = {};

	for(var i = 0; i < routeSegments.length; i++) {
		
		for(routeSegment in subRoutes) {
			if(routeSegment[0] === ':') {
				returnSegments[routeSegment.slice(1)] = routeSegments[i];
				subRoutes = subRoutes[routeSegment]
				break;
			} else if(routeSegment === routeSegments[i]) {
				subRoutes = subRoutes[routeSegment]
				break;
			}
		}
		
		if(i === routeSegments.length-1 && typeof subRoutes === 'function') {
			return {
				handler: subRoutes,
				params: returnSegments
			};
		}
	}
}

cache.register = function(route, cb) {
	var routeSegments;
	var routeSegment;
	var subRoute = cache.routes;

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
}