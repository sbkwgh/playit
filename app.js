var express = require('express');
var https = require('https');

var app = express();

function getHTTPSJSON(url, cb) {
	https.get(url, function(res) {
		var chunks = [];
		res.on('data', function(chunk) {
			chunks.push(chunk)
		});
		res.on('end', function() {
			cb(JSON.parse(chunks.join('')))
		});
	})
}

app.use(express.static('public'));

app.get('/api/coverimage', function(req, res) {
	var returnJSON = {};
	var albums = JSON.parse(req.query.albums);
	var baseURL = 
		'https://en.wikipedia.org/w/api.php?' +
		'action=query&prop=pageimages&format=json&' +
		'piprop=thumbnail&pithumbsize=200&pilimit=max&titles=';

	albums = albums.map(function(album) {
		var str = '';
		str += album.name + '|';
		str += album.name + ' (album)|';
		str += album.name + ' (' + album.artist + ' album)|';
		str += album.name + ' (' + album.artist + ' EP)';
		return str;
	});


	getHTTPSJSON(baseURL + albums.join('|'), function(json) {
		var pages = json.query.pages;
		for(var pageId in pages) {
			var page = pages[pageId];
			var title = page.title.split(' (')[0]
			if(+pageId < 0 || !page.thumbnail) {
				if(!returnJSON[title]) {
					returnJSON[title] = null;
				}
			} else {
				returnJSON[title] = page.thumbnail.source;
			}
		};

		res.json(returnJSON)
	});

})

app.get('/api/search', function(req, res) {
	var doneCount = 0;
	var albumURL =
		'https://api.spotify.com/v1/search?q=' +
		req.query.q +
		'&type=album';
	var songURL =
		'https://api.spotify.com/v1/search?q=' +
		req.query.q +
		'&type=track';
	var returnJSON = {
		albums: [],
		songs: []
	};

	function done() {
		doneCount++;
		if(doneCount === 2) {
			res.json(returnJSON)
		}
	}

	getHTTPSJSON(albumURL, function(json) {
		var albums = json.albums.items;

		for(var i = 0; i < albums.length; i++) {
			returnJSON.albums.push({
				title: albums[i].name,
				id: albums[i].id,
				coverImage: albums[i].images[1].url
			})
		}

		done();
	})
	getHTTPSJSON(songURL, function(json) {
		var tracks = json.tracks.items;

		for(var i = 0; i < tracks.length; i++) {
			var artists = [];
			for(var j = 0; j < tracks[j].artists.length; j++) {
				if(tracks[i].artists[j]) {
					artists.push(tracks[i].artists[j].name);
				}
			}
			returnJSON.songs.push({
				title: tracks[i].name,
				id: tracks[i].id,
				album: {
					coverImage: tracks[i].album.images[1].url,
					title: tracks[i].album.name,
					id: tracks[i].album.id
				},
				artist: artists.join(', '),
				duration: tracks[i].duration_ms / 1000
			})
		}

		done();
	})
});

app.listen(3000, function() {
	console.log('Listening at port 3000');
})