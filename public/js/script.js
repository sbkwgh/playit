function addHiddenAlbums(albumHolder) {
	albumHolder = document.querySelector(albumHolder);

	if(!albumHolder) return;
	var albums = albumHolder.querySelectorAll('.album');
	var albumsPerLine = albums.length;
	var albumsToAdd;
	var distanceBetweenAlbums;

	for(var i = 0; i < albums.length; i++) {
		if(albums[i].style.visibility === 'hidden') {
			albums[i].parentElement.removeChild(albums[i])
		}
	}

	albums = albumHolder.querySelectorAll('.album');

	/*for(var i = 0; i < albums.length; i++) {
		var album = albums[i];
		var nextAlbum = albums[i+1];
		if(nextAlbum && album.getBoundingClientRect().bottom !== nextAlbum.getBoundingClientRect().bottom) {
			albumsPerLine = i+1;
			break;
		}
		if(nextAlbum) {
			distanceBetweenAlbums = nextAlbum.getBoundingClientRect().left - album.getBoundingClientRect().right;
		}
	}



	albumsToAdd = albumsPerLine - (albums.length % albumsPerLine);

	console.log(distanceBetweenAlbums)

	if(albumsToAdd === albumsPerLine) return;*/

	/*for(var i = 0; i < albumsToAdd; i++) {*/
	while(
		albums[albums.length-1].getBoundingClientRect().bottom ===
		albumHolder.querySelectorAll('.album')[albumHolder.querySelectorAll('.album').length-1].getBoundingClientRect().bottom
	) {
		var hiddenAlbum = document.createElement('div');

		hiddenAlbum.classList.add('album');
		hiddenAlbum.style.pointerEvents = 'none';
		hiddenAlbum.style.visibility= 'hidden';

		albums[0].parentElement.appendChild(hiddenAlbum);
	}

	var albumsAdded = albumHolder.querySelectorAll('.album');
	var lastAlbum = albumsAdded[albumsAdded.length-1]
	var secondToLastAlbum = albumsAdded[albumsAdded.length-2];

	if(
		lastAlbum.getBoundingClientRect().bottom !==
		secondToLastAlbum.getBoundingClientRect().bottom
	) {
		lastAlbum.parentElement.removeChild(lastAlbum);
	}
}
window.addEventListener('resize', function() {
	addHiddenAlbums('.search-group');
	addHiddenAlbums('.search-group:last-child');
});

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
		div.target = ev.target;
		ev.preventDefault();
	});
};

document.querySelector('#menu-search_box').addEventListener('keydown', function(ev) {
	var query = ev.target.value.trim();
	if(query.length && ev.which === 13) {
		console.log(encodeURIComponent(query))
		app.change('/search/' + encodeURIComponent(query));
	}
})

document.querySelector('#app').addEventListener('click', function(ev) {
	if(ev.target.classList.contains('album')) {
		app.change('/album/' + ev.target.getAttribute('data-album-id'));
	}
})

function setBgColFromImgBorder(url, queryString) {
	var el = document.querySelector(queryString);
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	var img = new Image();

	img.crossOrigin= 'anonymous';
	img.src = url;
	img.onload = function() {
		var rgb = [];

		canvas.height = img.height;
		canvas.width = img.width;
		context.drawImage(img, 0, 0, img.width , img.height);

		for(var j = 0; j < 7; j++) {
			for(var i = 0; i < canvas.height; i+= 10) {
				var pixel = context.getImageData(canvas.width - j,i,1,1).data;
				if(i === 0) {
					rgb = [pixel[0], pixel[1], pixel[2]];
					continue;
				}
				if(pixel[0] < 50 && pixel[1] < [50] && pixel[2] < 50) continue;

				rgb[0] = Math.round((rgb[0] + pixel[0]) / 2);
				rgb[1] = Math.round((rgb[1] + pixel[1]) / 2);
				rgb[2] = Math.round((rgb[2] + pixel[2]) / 2);
			}	
		}
		if(el) {
			var averageDiff =
				Math.abs(rgb[0] - rgb[1]) +
				Math.abs(rgb[0] - rgb[2]) +
				Math.abs(rgb[1] - rgb[2]);
			averageDiff /= 3;

			if(averageDiff < 15) {
				el.querySelector('.album_header_background').style.filter = 'saturate(' + (15 - averageDiff)/1.25 + ')';
				el.querySelector('.album_header_background').style['-webkit-filter'] = 'saturate(' + (15 - averageDiff)/1.25 + ')';
				el.querySelector('.album_header_background-image').style.opacity = 0.1;
			}

			el.querySelector('.album_header_background-image').style.background = 'url(' + url + ')';

			if(rgb[0] < 100 && rgb[1] < 100 && rgb[2] < 100) {
				rgb[0] += 120;
				rgb[1] += 120;
				rgb[2] += 120;
			}
			el.querySelector('.album_header_background').style.background = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.5)';
		}
	};
}

document.querySelector('#menu').addEventListener('click', function(ev) {
	var selected = document.querySelector('.menu-menu_item_selected');
	var el = null;

	if(ev.target.parentElement.classList.contains('menu-menu_item')) {
		el = ev.target.parentElement;
	} else if(ev.target.classList.contains('menu-menu_item')) {
		el = ev.target;
	}

	if(el) {
		if(selected) {
			selected.classList.remove('menu-menu_item_selected');
		}
		el.classList.add('menu-menu_item_selected');
		location.hash = el.getAttribute('data-url');
	}
})

var app = new Router(document.querySelector('#app'));
app.addRoute('/search/:query', function(templateContainer, templateHTML, data, done) {
	var template = Handlebars.compile(templateHTML);

	Request.get('/api/search', {q: data.query}, function(musicData) {
		musicData.query = decodeURIComponent(data.query);
		templateContainer.innerHTML = template(musicData);
		addHiddenAlbums('.search-group');
		PlayQueue.highlightPlayingSong();
	})
}, function(done) {
	YouTube.init();
	YouTube.continueCb = function() {
		done();
	}
});
app.addRoute('/settings', function(templateContainer, templateHTML, data, done) {
	templateContainer.innerHTML = templateHTML;
}, function(done) {
	YouTube.init();
	YouTube.continueCb = function() {
		done();
	}
});
app.addRoute('/charts', function(templateContainer, templateHTML, data, done) {
	var template = Handlebars.compile(templateHTML);
	Request.get('/api/charts', {}, function(charts) {
		templateContainer.innerHTML = template({songs: charts});
	})
}, function(done) {
	YouTube.init();
	YouTube.continueCb = function() {
		done();
	}
});
app.addRoute('/album/:id', function(templateContainer, templateHTML, data, done) {
	var template = Handlebars.compile(templateHTML);

	Request.get('/api/album/' + data.id, {}, function(albumData) {
		albumData.totalTime = 
			Math.floor(
				albumData.songs.reduce(
					function(a, b) {
						if(a.duration) {
							return a.duration + b.duration;
						} else {
							return a + b.duration;
						}
					}
				) / 60
			);

		albumData.songs = albumData.songs.map(function(song) {
			var minutes = Math.floor(song.duration / 60);
			var seconds = Math.floor(song.duration % 60);
			if(seconds < 10) {
				seconds = '0' + seconds;
			}

			song.minutes = minutes + ':' + seconds;

			return song;
		})
		templateContainer.innerHTML = template(albumData);
		document.querySelector('#app').addEventListener('click', function(ev) {
			if(ev.target.id === 'new_playlist-button') {
				var contextMenu = ev.target.parentElement.parentElement.parentElement;
				var i = contextMenu.target;
				var tr = i.parentElement.parentElement;
				var td = tr.querySelectorAll('td');

				var title = document.querySelector('#new_playlist-input').value.trim();
				if(!title.length) return;

				var playlist = {
					title: title,
					songs: [
						{
							coverImage: tr.getAttribute('data-cover_image'),
							title: td[1].innerHTML,
							minutes: td[4].innerHTML,
							album: td[2].innerHTML,
							artist: td[3].innerHTML
						}
					]
				};

				playlists.add(playlist);

				contextMenu.removeContextMenu();
			}
		})
		var songMore = new Menu('td .song_more.song_more_album', {
		'Add to current playlist': function() {
			return playlists.tooltipPlaylists
		},
		'Add to a new playlist': {
			'<input class="" id="new_playlist-input"><div class="button btn-green" id="new_playlist-button">Create playlist</div>': function() {}
		}
	});
		setBgColFromImgBorder(document.querySelector('.album_header-album').src, '.album_header')
		PlayQueue.highlightPlayingSong();
	})
}, function(done) {
	YouTube.init();
	YouTube.continueCb = function() {
		done();
	}
});
app.addRoute('index', function(templateContainer, templateHTML, data) {
	Request.get('/api/topAlbums', {}, function(topAlbums) {
		var template = Handlebars.compile(templateHTML);
		templateContainer.innerHTML = template({albums: topAlbums, recentlyPlayed: store.get('recentlyPlayed')});
		addHiddenAlbums('.search-group');
		addHiddenAlbums('.search-group:last-child');
		PlayQueue.highlightPlayingSong();
	})
}, function(done) {
	YouTube.init();
	YouTube.continueCb = function() {
		done();
	}
});

document.querySelector('#app').addEventListener('click', function(ev) {
	if(
		ev.target.classList.contains('delete-playlist') ||
		ev.target.parentElement.classList.contains('delete-playlist')
	) {
		playlists.remove(location.hash.split('/')[1])
		location.hash = '';
	}
})

app.addRoute('/playlist/:id', function(templateContainer, templateHTML, data) {
	var template = Handlebars.compile(templateHTML);
	var playlistData = playlists.find(data.id);

	var songMore = new Menu('td .song_more.song_more_playlist', {
		'Remove from playlist': function(ev) {
			var el = ev.target.parentElement.target;
			var index = el.getAttribute('data-index');
			var tr = el.parentElement.parentElement;
			
			var playlist = playlists.find(tr.getAttribute('data-id'));

			playlist.songs.splice(index, 1);
			playlists.update(playlist)

			tr.parentElement.removeChild(tr);
			ev.removeContextMenu();
		}
	});

	if(!playlistData) playlistData = {error: true};

	templateContainer.innerHTML = template(playlistData);
	PlayQueue.highlightPlayingSong();
}, function(done) {
	YouTube.init();
	YouTube.continueCb = function() {
		done();
	}
})

CurrentPlaying.clear();

//Play/pause on space bar
document.body.addEventListener('keydown', function(ev) {
	if(ev.which === 32 && ev.target.tagName !== 'INPUT' && ev.target.tagName !== 'TEXTAREA') {
		document.querySelector('#player-controller_buttons-play_pause').click();
		ev.preventDefault();
	}
})

document.querySelector('#app').addEventListener('click', function(ev) {
	if(ev.target.tagName === 'TD') {
		var tr = ev.target.parentElement;
		var table = ev.target.parentElement.parentElement;
		var trs = table.querySelectorAll('tr');

		var positionInTable = [].indexOf.call(trs, tr)

		var songs = [];
		
		for(var i = positionInTable; i < trs.length; i++) {
			songs.push({
				song: trs[i].querySelectorAll('td')[1].innerHTML,
				artist: trs[i].querySelectorAll('td')[3].innerHTML,
				albumId: trs[i].getAttribute('data-id') || location.hash.split('/')[2],
				coverImage: trs[i].getAttribute('data-cover_image')
			})
			console.log(trs[i].getAttribute('data-id') || location.hash.split('/')[2])
		}

		doneNum = 0;

		function done(position) {
			doneNum++;
			if(doneNum === songs.length) {
				PlayQueue.queue = PlayQueue.queue.filter(function(n){ return n != undefined });
			}
			if(position === 0 && PlayQueue.queue[0]) {
				PlayQueue.play(PlayQueue.queue[0]);
			}
		}

		function getId(song, artist, albumId, coverImage, position) {
			Request.get('/api/youtube', {song: song, artist: artist}, function(data) {
				if(data.error) {
					console.log(data.error)
					alert('Sorry - couldn\'t find that song')
				} else {
					PlayQueue.queue[position] = {song: song, artist: artist, id: data.id, albumId: albumId, coverImage: coverImage}
					done(position)
				}
			})
		}
	
		for(var i = 0; i < songs.length; i++) {
			getId(songs[i].song, songs[i].artist, songs[i].albumId, songs[i].coverImage, i)
		}
	}
})