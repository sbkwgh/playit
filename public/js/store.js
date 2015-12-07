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

	this.update = function(updatedItem) {
		var index = getIndex(updatedItem.id);

		store.update('playlists', index, updatedItem);
		updateEl();
	};

	this.remove = function(id) {
		var index = getIndex(id);

		store.remove('playlists', index);
		updateEl();
	};

	this.add = function(item) {
		item.id = getId();
		store.add('playlists', item);
		updateEl();
	}

	updateEl();
})
