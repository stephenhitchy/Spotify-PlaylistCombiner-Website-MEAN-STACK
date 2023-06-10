const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema( {
    email : { type : String, unique : true},
    password : { type : String, required : true},
    permissions : { type : String, required : true},
    enabled : { type : Boolean, required : true}
});

const User = mongoose.model('User', UserSchema);

module.exports = User;