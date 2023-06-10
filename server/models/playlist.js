const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema( {
    name : { type : String },
    type : { type : String },
    tracks : { type : Array },
    people : { type : Array },
    range : { type : String },
    length : { type : Number },
    code : { type : Number }
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);

module.exports = Playlist;