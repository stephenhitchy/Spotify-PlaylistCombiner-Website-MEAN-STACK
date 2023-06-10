const { request } = require('express');
var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../models/playlist');
const Playlist = require('../models/playlist');
const User = require('../models/user');
const TOKEN = "https://accounts.spotify.com/api/token";

const PLAYLISTS = "https://api.spotify.com/v1/playlists/5wUFgVW5aOr6ay5PJbK23P?si=aa0f019b338e41c6";

var redirect_uri = 'http://138.49.185.203:3000/api/v1/cb'
var client_id = '603bc873db7c41cbad07a26c65e6b97c';
var client_secret = '3c4b89a92a15464686e82c39781fedd9';

require('./mock')();

router.get('/cb',function(req,res) {
  req.session.code = req.query.code;
  res.redirect('/');
});

router.get('/code', function(req, res) {
  let body = "grant_type=authorization_code";
  body += "&code=" + req.session.code; 
  body += "&redirect_uri=" + encodeURI(redirect_uri);
  body += "&client_id=" + client_id;
  body += "&client_secret=" + client_secret;
  res.send({code : body, user : req.session.user});
});

router.get('/test', function(req, res) {
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: req.session.code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' +  Buffer.from(client_id + ":" + client_secret, 'base64')
    },
    json: true
  };

  router.get('/account', function(req, res) {
    res.send({'user': req.session.user});
  })

  router.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

router.post('/users/:userid', function(req, res) {
  let playlist = new Playlist();
  playlist.name = req.body.name;
  playlist.type = req.body.type;
  playlist.tracks = req.body.tracks;
  playlist.people = req.body.people;
  playlist.range = req.body.range;
  playlist.length = req.body.length;
  playlist.code = req.body.code;
  try {
    var r = Playlist.insertMany(playlist);
  } catch(error) {
    console.log('playlist produced error');
  }
  if(playlist) {
    res.send({playlist : playlist});
  }else {
    res.send({error: 'no playlist made'});
  }
});

router.get('/users/:userid', function(req, res) {
  var outputs = [];
  Playlist.find({}, (err, playlistList) => {
    playlistList.forEach(curPlaylist => {
      var owners = curPlaylist['people'];
      owners.forEach(person => {
        if(person == req.params.userid){
          outputs.push(curPlaylist);
        }
      });
    });
    res.send({playlist : outputs});
  })
});

router.get('/playlists/:code', function(req, res) {
  var outputs = [];
  Playlist.find({}, (err, playlistList) => {
    playlistList.forEach(curPlaylist => {
      if(curPlaylist['code'] == req.params.code){
        outputs.push(curPlaylist);
      }
    });
    if(outputs){
      res.send({playlist : outputs});
    }else{
      res.status(403).send({msg : 'No game found'});
    }
  });
});

router.put('/users/:playlistId', function(req,res) {
  var people = req.body.ourPeople;
  Playlist.updateOne({'_id' : req.params.playlistId}, {$set: {'people' : people}}).then(x => {
    console.log(x);
  });
  res.send({'msg':'200 OK'});
});

router.put('/users/:playlistId/tracks', function(req,res) {
  var tracks = req.body.tracks;
  Playlist.updateOne({'_id' : req.params.playlistId}, {$set: {'tracks' : tracks}}).then(x => {
    console.log(x);
  });
  res.send({'msg':'200 OK'});
});

router.get('/users', function(req,res) {
  var output = [];
  User.find({}, (err, users) => {
    output.push(users);
    res.send({users: output});
  });
});

router.put('/users/:userid/properties/:property', function(req,res) {
  var property = req.params.property;
  var val = req.body.property;
  if(property == 'enabled'){
    User.updateOne({'_id' : req.params.userid}, {$set: { 'enabled' : val}}).then(x => {
      console.log(x);
    });
  }else{
    User.updateOne({'_id' : req.params.userid}, {$set: { 'permissions' : val + ""}}).then(x => {
      console.log(x);
    });
  }
  res.send({'res' : '200 OK'});
});

module.exports = router;
