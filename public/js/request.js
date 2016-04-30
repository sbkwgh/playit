var Request = {};
Request.serializeData = function(object) {
	var temp = '';
	var serializedString = '';
	for(var key in object) {
		if(object[key] === undefined) continue;
		if(typeof object[key] === 'object') {
			temp = '&' + key + '=' + encodeURIComponent(JSON.stringify(object[key]));
		} else {
			temp = '&' + key + '=' + encodeURIComponent(object[key]);
		}
		serializedString += temp;
	}
	return serializedString.slice(1);
};
Request.request = function(method, url, data, cb) {
	var http = new XMLHttpRequest();

	http.addEventListener('load', function() {
		var json;

		try {
			json = JSON.parse(this.responseText)
		} catch(err) {
			console.log(err);
			console.log(this.responseText);
		}

		if(cb) {
			cb(json);
		}
	})

	http.open(method, url, true);
	http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	if(typeof data !== 'function') {
		http.send(this.serializeData(data));
	} else {
		http.send();
	}
}
Request.post = function(url, data, cb) {
	this.request('post', url, data, cb);
};
Request.delete = function(url, data, cb) {
	this.request('delete', url, data, cb);
};
Request.put = function(url, data, cb) {
	this.request('put', url, data, cb);
};
Request.get = function(url, data, cb) {
	var http = new XMLHttpRequest();

	http.addEventListener('load', function() {
		if(cb) {
			cb(JSON.parse(this.responseText));
		}
	})

	http.open('GET', url + '/?' + this.serializeData(data || {}), true);
	http.send();
};

var Model = {
	getType: function(val) {
		if(typeof val !== 'object') {
			return typeof val;
		} else if(Array.isArray(val)) {
			return 'array';
		} else if(val === null) {
			return 'null';
		} else {
			return typeof val;
		}
	},
	new: function(modelName, modelDefn, updateDelay, updateFunction) {
		var modelFactory = function(params) {
			var self = this;
			var _data = {};

			this.data = {};
			this.changedObject = {};

			if(updateFunction) {
				this.updateFunction = updateFunction.bind(this);
			}

			this.save = function(cb) {
				var url = Model.rootUrl + '/' + modelFactory.modelName;
				var dataNoUndefined = {};

				for(var key in _data) {
					if(_data[key] !== undefined) {
						dataNoUndefined[key] = _data[key];
					}
				}

				Request.post(url, dataNoUndefined, function(modelInstance) {
					if(modelInstance._id) {
						self.data._id = modelInstance._id;
					}
					cb(modelInstance.error, modelInstance);
				})
			}

			this.delete = function(cb) {
				if(!this.data[modelFactory.primaryKey]) {
					throw new Error('Model instance does not have primary key field "' + modelFactory.primaryKey + '"');
					return;
				}
				var url = Model.rootUrl + '/' + modelFactory.modelName + '/' + this.data[modelFactory.primaryKey];
				Request.delete(url, function(result) {
					cb(result.error, result);
				})
			}

			this.update = function(cb, specificData) {
				if(!this.data[modelFactory.primaryKey]) {
					throw new Error('Model instance does not have primary key field "' + modelFactory.primaryKey + '"');
					return;
				}
				var url = Model.rootUrl + '/' + modelFactory.modelName + '/' + this.data[modelFactory.primaryKey];
				Request.put(url, specificData || _data, function(modelInstance) {
					cb(modelInstance.error, modelInstance);
				})
			}
			

			this.post = function(url, cb) {	
				var url = Model.rootUrl + '/' + modelFactory.modelName + '/' + url;
				Request.post(url, _data, cb);
			}

			//Create getter/setter for each field
			// which checks type on setting
			function getSetProp(proxyObj, prop, originalObj, type) {
				Object.defineProperty(proxyObj, prop, {
					get: function() {
						return originalObj[prop];
					},
					set: function(val) {
						if(Model.getType(val) !== type) {
							throw new TypeError('Field "' + prop + '" must be of type "' + type + '"');
						} else {
							originalObj[prop] = val;
							self.changedObject[prop] = val;
						}
					}
				})
			}
			for(var prop in modelDefn) {
				var type = modelDefn[prop].type || modelDefn[prop];

				if(modelDefn[prop].primaryKey) {
					modelFactory.primaryKey = prop;
				}

				if(typeof params[prop] !== undefined) {
					_data[prop] = params[prop];
				}

				getSetProp(self.data, prop, _data, type);
			}

			setInterval(function() {
				if(Object.keys(self.changedObject).length && self.updateFunction) {
					self.update(self.updateFunction, self.changedObject)
					self.changedObject = {};
				}
			}, modelFactory.updateDelay)
		};

		modelFactory.modelName = modelName;

		modelFactory.get = function(idOrCb, cb) {
			var url = Model.rootUrl + '/' + modelFactory.modelName;
			if(typeof idOrCb !== 'function') {
				url += '/' + idOrCb;
			}
			
			Request.get(url, {}, function(modelInstances) {
				if(cb) {
					cb(modelInstances.error, modelInstances);
				} else {
					idOrCb(modelInstances.error, modelInstances);
				}
			})
		};

		modelFactory.updateDelay = updateDelay;
		
		return modelFactory;
	}
};