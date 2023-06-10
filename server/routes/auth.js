var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
let User = require('../models/user');
const { use } = require('./api');

function error(res) {
    res.status(401).json();
}

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.send({'msg':'ok'});
    });
});

router.post('/login', function (req, res) {
    var isValid = false;
    var err2 = '';
    
    req.session.regenerate(function (err) {
        if (err) {
            error(res);
        } else {
            let username = req.body.username || '';
            let password = req.body.password || '';

            User.findOne({ email: username, enabled: true }, (err, user) => {
                if (err || !user) {
                    error(res);
                } else {
                    if (password == user.password) {
                        isValid = true;
                    }
                    if (err2 || !isValid) {
                        error(res);
                    } else {
                        req.session.user = user;
                        res.header('x-csrf-token', uuidv4());
                        let userNoPassword = {
                            email: user.email,
                            _id: user._id,
                            permissions: user.permissions,
                            enabled: user.enabled
                        };
                        res.json(userNoPassword);
                    }
                }
            });
        }
    });
});

module.exports = router;