var express = require('express');
var https = require('https');
var path = require('path');

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

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../public', 'index.html'));
})

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

app.get('/api/album/:id', function(req, res) {
	getHTTPSJSON('https://api.spotify.com/v1/albums/' + req.params.id, function(json) {
		if(json.error) {
			res.json({songs:[],error:true});
			return;
		}
		var returnJSON = {
			artist: [],
			title: json.name,
			releaseDate: json.release_date,
			songs: [],
			coverImage: json.images[1].url
		};
		json.artists.forEach(function(artist) {
			returnJSON.artist.push(artist.name)
		});
		returnJSON.artist = returnJSON.artist.join(',');
		json.tracks.items.forEach(function(song) {
			var songObj = {
				artist: [],
				duration: song.duration_ms / 1000,
				id: song.id,
				album: {
					title: json.name
				},
				title: song.name
			};
			song.artists.forEach(function(artist) {
				songObj.artist.push(artist.name)
			});
			songObj.artist = songObj.artist.join(',');

			returnJSON.songs.push(songObj);
		})
		res.json(returnJSON)
	})
});

app.get('/api/youtube', function(req, res) {
	getHTTPSJSON(
		'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' +
		req.query.song + ' , ' + req.query.artist +
		'&type=video&videoCategoryId=10&videoEmbeddable=true&fields=etag%' + 
		'2CeventId%2Citems%2Ckind%2CnextPageToken%2CpageInfo%2CprevPageToken%2CtokenPagination%2CvisitorId&key=' + 
		'AIzaSyD_bAecEakNgYHmORtwlNvNxBVU5Dbc1m4'
	, function(json) {
		var videos = json.items;
		if(
			!videos.length
		) {
			res.json({error: 'no videos found'});
		} else {
			res.json({id: videos[0].id.videoId})
		}
	})
})

app.get('/api/trackCoverImage/:id', function(req, res) {
	getHTTPSJSON(
		'https://api.spotify.com/v1/tracks/' + req.query.id
	, function(json) {
		if(json.error) {
			res.json({error: 'invalid id'})
		} else {
			res.json({url: json.album.images[2].url})
		}
	})
})

app.get('/api/topAlbums', function(req, res) {
	var doneCount = 0;
	var returnAlbums = [];
	function done(album) {
		doneCount++;
		if(album) returnAlbums.push(album);
		if(doneCount === 10) {
			res.json(returnAlbums.slice(0,5));
		}
	}

	getHTTPSJSON('https://itunes.apple.com/us/rss/topalbums/limit=25/explicit=true/json', function(json) {
		var albums = json.feed.entry;
		var returnJSON = [];
		for(var i = 0; i < albums.length; i++) {
			returnJSON.push({
				title: albums[i].title.label,
				artist: albums[i]['im:artist'].label
			})
		}

		returnJSON.forEach(function(album) {
			var albumURL =
				'https://api.spotify.com/v1/search?q=' +
				'album:' + encodeURIComponent(album.title) +
				'%20artist:' + encodeURIComponent(album.artist) +
				'&type=album';

			getHTTPSJSON(albumURL, function(albumResults) {
				var results = albumResults.albums.items;
				if(results.length) {
					album.id = results[0].id;
					album.coverImage = results[0].images[1].url;
					done(album);
				} else {
					done(false);
				}
			})
		});
	})
})

app.listen(3000, function() {
	console.log('Listening at port 3000');
})