var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var morgan = require('morgan');
var compress = require('compression');

var app = express();

app.use(compress());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../public', 'index.html'));
})

app.use(morgan('dev'));

//Require routes
require('./routes.js')(app);

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/playit');
db = mongoose.connection;

db.on('err', function() {
	console.log('Error in connecting to mongodb');
})

db.once('open', function() {
	console.log('Connected to mongodb');
	app.listen(process.env.PORT || 3000, function() {
		console.log('Listening on port ' + (process.env.PORT || 3000))
	});
});