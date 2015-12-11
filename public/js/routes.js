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
app.addRoute('/404/:route', function(templateContainer, templateHTML, data, done) {
	var template = Handlebars.compile(templateHTML);
	console.log(data)
	templateContainer.innerHTML = template(data);
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
			'<input class="" id="new_playlist-input" placeholder="Playlist name"><div class="button btn-green" id="new_playlist-button">Create playlist</div>': function() {}
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