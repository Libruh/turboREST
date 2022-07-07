const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { ssl } = require ('./config.json')

var fs = require('fs');
var http = require('http');
var https = require('https');

var privateKey  = fs.readFileSync(ssl.privkey, 'utf8');
var certificate = fs.readFileSync(ssl.fullchain, 'utf8');

var credentials = {key: privateKey, cert: certificate};

app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//Routes
const playlists = require('./routes/playlists')
const users = require('./routes/users')
const events = require('./routes/events')
const leaderboard = require('./routes/leaderboard')
app.use('/api/playlists/', playlists)
app.use('/api/playlist/', playlists)
app.use('/api/users/', users)
app.use('/api/events/', events)
app.use('/api/leaderboard/', leaderboard)

// Basic route
app.get('/api/', (req, res) => {
    res.send('This is the ROOT');
})

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});

httpsServer.listen(5039);
