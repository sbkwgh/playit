var mongoose = require('mongoose');
var crypto = require('crypto');

var playlistSchema = mongoose.Schema({
	id: String,
	json: String,
	key: String
});

playlistSchema.pre('save', function(next) {
	var self = this;
	crypto.randomBytes(48, function(err, buffer) {
		var token = buffer.toString('hex');
		self.key = token;
		next();
	});
});

var Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;