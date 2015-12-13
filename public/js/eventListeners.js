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

document.querySelector('#app').addEventListener('click', function(ev) {
	if(
		ev.target.classList.contains('delete-playlist') ||
		ev.target.parentElement.classList.contains('delete-playlist')
	) {
		playlists.remove(location.hash.split('/')[1])
		location.hash = '';
	}
})

//Play/pause on space bar
document.body.addEventListener('keydown', function(ev) {
	if(ev.which === 32 && ev.target.tagName !== 'INPUT' && ev.target.tagName !== 'TEXTAREA') {
		document.querySelector('#player-controller_buttons-play_pause').click();
		ev.preventDefault();
	}
})

document.querySelector('#app').addEventListener('click', function(ev) {
	if(ev.target.parentElement.classList.contains('charts')) {
		location.hash = 'album/' + ev.target.parentElement.getAttribute('data-id');
	}
	if(
		ev.target.tagName === 'TD' && 
		!ev.target.parentElement.classList.contains('charts') &&
		!ev.target.parentElement.classList.contains('playqueue-table') 
	) {
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

document.querySelector('#app').addEventListener('click', function(ev) {
	if(ev.target.id === 'settings-delete-recently_played') {
		delete localStorage.recentlyPlayed;
		document.querySelector('#settings-delete-recently_played_success').style.opacity = '1';
		setTimeout(function() {
			document.querySelector('#settings-delete-recently_played_success').style.opacity = '0';
		}, 3000);
	}
})
document.querySelector('#app').addEventListener('click', function(ev) {
	if(ev.target.id === 'settings-delete-playlists') {
		var deletePlaylists = confirm('Are you sure you want to delete playlists? This action cannot be undone.');
		if(deletePlaylists) {
			var playlistItems = playlists.playlists;
			for(var i = 0; i < playlistItems.length; i++) {
				playlists.remove(i);
			}

			document.querySelector('#settings-delete-playlists_success').style.opacity = '1';
			setTimeout(function() {
				document.querySelector('#settings-delete-playlists_success').style.opacity = '0';
			}, 2000);
		}
	}
})

document.querySelector('#shuffle_queue').addEventListener('click', function() {
	var queue = PlayQueue.queue;
	var currentItem = PlayQueue.queue[PlayQueue.currentPosition];
	var retArr = Array.apply(null, new Array(queue.length));

	retArr[0] = currentItem;

	function randInt(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	for(var i = 0; i < queue.length; i++) {
		if(queue[i] === currentItem) continue;

		var randNum = randInt(0, queue.length);
		if(retArr[randNum] !== undefined) {
			while(retArr[randNum] !== undefined) {
				randNum = randInt(0, queue.length);
			}
		}
		retArr[randNum] = queue[i];
	}

	PlayQueue.currentPosition = 0;
	PlayQueue.queue = retArr;
});

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