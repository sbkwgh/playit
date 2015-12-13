var YouTubeFactory = function(playerStateChange) {
	var self = this;

	this.playerStateChange = playerStateChange;

	this.init = function() {
		var scriptTag;
		var firstScriptTag;

		var ytPlayer;

		scriptTag = document.createElement('script');
		scriptTag.src = 'https://www.youtube.com/iframe_api';
		firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag);

		ytPlayer = document.createElement('div');
		ytPlayer.setAttribute('id', 'yt_player');

		document.body.appendChild(ytPlayer);
	}

	this.player = null;

	this.clearPlayer = function() {
		var playerEl = document.querySelector('#yt_player');
		var newPlayerEl = document.createElement('div');

		newPlayerEl.setAttribute('id', 'yt_player');
		document.querySelector('#yt_player').parentNode.replaceChild(
			newPlayerEl,
			playerEl
		);
	}

	this.createPlayer = function(id, onReady) {
		this.clearPlayer();

		this.player = new YT.Player('yt_player', {
			height: '200',
			width: '200',
			videoId: id,
			events: {
				onReady: onReady,
				onStateChange: self.playerStateChange
			}
		})
	}

	setInterval(function() {
		if(self.player && self.player.getCurrentTime) {
			slider.songLength.completed = Math.round(self.player.getCurrentTime());
		}
	}, 500);

	window.onYouTubeIframeAPIReady = function() {
		self.continueCb();
	}
}

var PlayQueue = new (function() {
	var self = this;
	var _currentPosition = 0;

	this.queue = [];
	
	Object.defineProperty(this, 'currentPosition',	 {
		get: function() {
			return _currentPosition;
		},
		set: function(val) {
			var previousPosition = _currentPosition;
			if(!self.queue.length) return;
			if(val < 0 || val > self.queue.length-1) {
				YouTube.clearPlayer();
				CurrentPlaying.clear();
				slider.clear();
				_currentPosition = 0;
				PlayPauseButton.pause(true);
				return;
			} else {
				_currentPosition = val;
			}

			self.play(self.queue[_currentPosition]);
		}
	})

	this.highlightPlayingSong = function() {
		var currentlyPlayingSong = document.querySelector('.currently_playing');
		var trEls;
		var newPlayingSong;

		//Remove highlight from currently highlighted song
		if(currentlyPlayingSong) {
			currentlyPlayingSong.classList.remove('currently_playing');
		}

		//If no song is playing, don't rehighlight anything
		if(slider.songLength.total === 0 || !self.queue.length) {
			return;
		}

		//Find currently playing song and highlight it
		trEls = document.querySelectorAll('tr');
		for(var i = 0; i < trEls.length; i++) {
			var td = trEls[i].querySelectorAll('td');
			var artist = self.queue[_currentPosition].artist;
			var song = self.queue[_currentPosition].song;

			if(!td.length) continue;

			if(td[1].innerHTML === song && td[3].innerHTML === artist) {
				trEls[i].classList.add('currently_playing');
				break;
			}
		}

	}

	this.play = function(nextUp) {
		function addRecentlyPlayedArtist(param) {
			var recentlyPlayed = store.get('recentlyPlayed');
			var alreadyInRecentlyPlayed = false;

			recentlyPlayed.forEach(function(album) {
				if(album.coverImage === param.coverImage) {
					alreadyInRecentlyPlayed = true;
				}
			})
			if(!alreadyInRecentlyPlayed) {
				if(recentlyPlayed.length === 5) {
					store.remove('recentlyPlayed', 0);
				}

				store.add('recentlyPlayed', {
					title: param.title,
					coverImage: param.coverImage,
					id: param.albumId
				});
			}
		}

		YouTube.createPlayer(nextUp.id, function() {
			var albumArt = nextUp.coverImage;
			slider.songLength.completed = 0;
			YouTube.player.setVolume(volume.completed.percent);
			slider.songLength.total = YouTube.player.getDuration();
			CurrentPlaying.artist = nextUp.artist;
			CurrentPlaying.song = nextUp.song;
			if(albumArt) {
				CurrentPlaying.coverImage = albumArt;
				PlayPauseButton.play();
				self.highlightPlayingSong();

				addRecentlyPlayedArtist({
					title: nextUp.song,
					coverImage: albumArt,
					albumId: nextUp.albumId
				})
			} else {
				Request.get('/api/trackCoverImage/' + nextUp.songId, function(json) {
					if(json.error) {
						CurrentPlaying.clearCoverImage();
						PlayPauseButton.play();
					} else {
						CurrentPlaying.coverImage = json.url;
						PlayPauseButton.play();
						self.highlightPlayingSong();
						addRecentlyPlayedArtist({
							title: nextUp.song,
							coverImage: json.url,
							albumId: nextUp.albumId
						})
					}
				});
			}
			
		});
	}
	this.playerStateChange = function(state) {
		if(state.data === 0) {
			var previousPosition = self.currentPosition;
			self.currentPosition = self.currentPosition+1;
			var nextUp = self.queue[self.currentPosition];
			if(self.currentPosition === previousPosition) {
				YouTube.clearPlayer();
				CurrentPlaying.clear();
				slider.clear();
				PlayPauseButton.pause(true);
			} else {
				self.play(nextUp)
			}

			self.highlightPlayingSong();
		}
	};
	Object.defineProperty(this, 'tooltipQueue', {
		get: function() {
			var retObj = {};
			var queue = self.queue;

			function addFunc(item, i) {
				var htmlStr; 
				if(i === self.currentPosition) {
					htmlStr = '<table><tr class="playqueue-table currently_playing">';
				} else {
					htmlStr = '<table><tr class="playqueue-table">';
				}
				
				htmlStr+=
					'<td><img src=' + item.coverImage + '></td>' +
					'<td>' +
					item.song +
					'<br/><i>' +
					item.artist +
					'</i></td>' +
					'</tr></table>';

				retObj[htmlStr] = function(ev) {
					ev.removeContextMenu();
					if(item.albumId) location.hash = 'album/' + item.albumId;
				}
			}

			for(var i = 0; i < queue.length; i++) {
				var item = queue[i];
				addFunc(item, i);
			}
			if(!Object.keys(retObj).length) {
				retObj['Nothing in the queue'] = function(){};
			}
			return retObj;
		}
	});
});

var YouTube = new YouTubeFactory(PlayQueue.playerStateChange);
