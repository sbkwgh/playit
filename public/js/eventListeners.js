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
	if(ev.target.tagName === 'TD' && !ev.target.parentElement.classList.contains('charts')) {
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