var express = require('express');
var passport = require('passport');
var bodyparser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var cookieparser = require('cookie-parser');

var app = express();

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(multer());
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: 'this is the secret' }));
app.use(cookieparser());
app.use(passport.session());

passport.use(new LocalStrategy(
function (username, password, done) {
    return done(null, false, { message: 'Unable to login' });
}));

mongoose.connect('mongodb://localhost/project');

app.post("/login", passport.authenticate('local'), function (req, res) {
    res.json(req.user);
})

app.listen(port, ip);
