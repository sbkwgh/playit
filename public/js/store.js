if(!localStorage) {
	localStorage = chrome.storage.local;
}

var store = {
	get: function(name) {
		var items = JSON.parse(localStorage.getItem(name));
		return items || [];

	},
	add: function(name, item) {
		var items = this.get(name);
		items.push(item);

		localStorage.setItem(name, JSON.stringify(items));
	},
	update: function(name, index, updatedItem) {
		var items =  this.get(name);
		items[index] = updatedItem;

		localStorage.setItem(name, JSON.stringify(items));
	},
	remove: function(name, index) {
		var items = this.get(name);
		items.splice(index, 1);

		localStorage.setItem(name, JSON.stringify(items));
	}
};

var playlists = new (function() {
	var getId, getIndex, updateEl;
	var self = this;

	Object.defineProperty(this, 'playlists', {
		get: function() {
			return store.get('playlists');
		}
	});
	Object.defineProperty(this, 'tooltipPlaylists', {
		get: function() {
			var playlists = self.playlists;
			var obj = {};

			function addObj(title, playlist) {
				obj[title] = function(ev) {
					var el = ev.target;
					var tooltip = el.parentElement.parentElement;
					var i = tooltip.target;
					var tr = i.parentElement.parentElement;
					var td = tr.querySelectorAll('td');

					if(!playlist.songs) {
						playlist.songs = [];
					}

					playlist.songs.push({
						coverImage: tr.getAttribute('data-cover_image'),
						title: td[1].innerHTML,
						minutes: td[4].innerHTML,
						album: td[2].innerHTML,
						artist: td[3].innerHTML
					});

					self.update(playlist);
					ev.removeContextMenu();
				}
			}

			for(var i = 0; i < playlists.length; i++) {
				addObj(playlists[i].title, playlists[i])
			}

			return obj;
		}
	});

	updateEl = function() {
		var templateHTML = document.querySelector('#playlists_template').innerHTML;
		var template = Handlebars.compile(templateHTML);

		document.querySelector('#playlists').innerHTML = template({playlists: self.playlists});
	}

	this.updateEl = updateEl;

	getId = function() {
		var id = parseInt((Math.random() * 10e15)).toString(32);
		if(this.find(id)) {
			return getId();
		} else {
			return id;
		}
	};

	getIndex = function(id) {
		var playlists = self.playlists;
		var index;

		for(var i = 0; i < playlists.length; i++) {
			if(playlists[i].id === id) {
				index = i;
				break;
			}
		}

		return index;
	};

	this.getIndex = getIndex;

	this.find = function(id) {
		var playlists = this.playlists;
		var returnPlaylist = null;

		for(var i = 0; i < playlists.length; i++) {
			if(playlists[i].id === id) {
				returnPlaylist = playlists[i];
				break;
			}
		}

		return returnPlaylist;
	};

	this.findAll = function() {
		return this.playlists;
	}

	this.update = function(updatedItem) {
		var index = getIndex(updatedItem.id);

		var apiJSONCopy = Object.assign({}, updatedItem);
		delete apiJSONCopy.key;
		delete apiJSONCopy._id;

		store.update('playlists', index, updatedItem);

		if(updatedItem.key) {
			Request.put('/api/share', {
				_id: updatedItem._id,
				key: updatedItem.key,
				json: apiJSONCopy
			});
		}
		

		updateEl();
	};

	this.remove = function(id) {
		var index = getIndex(id);
		var playlistItem = this.find(id);

		store.remove('playlists', index);
		
		if(playlistItem.key) {
			Request.delete('/api/share', playlistItem);
		}
		
		updateEl();
	};

	this.add = function(item) {
		item.id = getId();

		/*function incrementName() {
			this.playlists.forEach(function(playlist) {
				if(playlist.title === item.title)
			});
		}*/
		

		item.dateCreated = new Date();

		store.add('playlists', item);
		updateEl();
	};

	this.makeShared = function(id, cb) {
		var self = this;
		var playlistItem = this.find(id);

		Request.post('/api/share', {json: playlistItem}, function(result) {
			var savedPlaylist = JSON.parse(result.json);
			savedPlaylist._id = result._id;
			savedPlaylist.key = result.key;

			self.update(savedPlaylist);

			cb();
		})
	};

	this.makeUnshared = function(id) {
		var self = this;
		var playlistItem = this.find(id);

		if(!playlistItem.key) return;

		Request.delete('/api/share', playlistItem, function(result) {
			if(!result.error) {
				delete playlistItem.key;
				delete playlistItem._id;

				self.update(playlistItem);
				self.updateEl();
			}
			
		})
	}

	updateEl();
})
