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
	if(!albums[albums.length-1]) return;
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

CurrentPlaying.clear();