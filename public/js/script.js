function addHiddenAlbums(albumHolder) {
	if(!albumHolder) return;
	var albums = albumHolder.querySelectorAll('.album');
	var albumsPerLine;
	var albumsToAdd;

	for(var i = 0; i < albums.length; i++) {
		if(albums[i].style.visibility === 'hidden') {
			albums[i].parentElement.removeChild(albums[i])
		}
	}

	albums = albumHolder.querySelectorAll('.album');

	for(var i = 0; i < albums.length; i++) {
		var album = albums[i];
		var nextAlbum = albums[i+1];
		if(nextAlbum && album.getBoundingClientRect().bottom !== nextAlbum.getBoundingClientRect().bottom) {
			albumsPerLine = i+1;
			break;
		}
	}

	albumsToAdd = albumsPerLine - (albums.length % albumsPerLine);
	if(albumsToAdd === albumsPerLine) return;

	for(var i = 0; i < albumsToAdd; i++) {
		var hiddenAlbum = document.createElement('div');
		hiddenAlbum.classList.add('album');
		hiddenAlbum.style.pointerEvents = 'none';
		hiddenAlbum.style.visibility= 'hidden';

		albums[0].parentElement.appendChild(hiddenAlbum);
	}
}

addHiddenAlbums(document.querySelector('.search-group'));
window.addEventListener('resize', function() {
	addHiddenAlbums(document.querySelector('.search-group'));
})

document.querySelector('#menu-search_box').addEventListener('keydown', function(ev) {
	var query = ev.target.value.trim();
	if(query.length && ev.which === 13) {
		app.change('/search/' + query)
	}
})

var app = new Router(document.querySelector('#app'));
app.addRoute('/search/:query', function(templateContainer, templateHTML, data) {
	var template = Handlebars.compile(templateHTML);

	Request.get('/api/search', {q: data.query}, function(musicData) {
		musicData.query = data.query;
		console.log(musicData)
		templateContainer.innerHTML = template(musicData);
	})
});
app.addRoute('index', function(templateContainer, templateHTML, data) {
	templateContainer.innerHTML = templateHTML;
});