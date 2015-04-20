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
app.use(session({ secret: 'this is the secret' }));
app.use(cookieparser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

// default to a 'localhost' configuration:
var connection_string = 'localhost/project';
// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}

var db = mongoose.connect('mongodb://' + connection_string);

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    friends: [String],
    events: [String]
});

var UserModel = mongoose.model("UserModel", UserSchema);



passport.use(new LocalStrategy(
function (username, password, done) {
    UserModel.findOne({ username: username, password: password }, function (err, user) {
        if (user) {
            return done(null, user)
        }
        return done(null, false, { message: 'Unable to login' });
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// login user
app.post("/login", passport.authenticate('local'), function (req, res) {
    res.json(req.user);
});

// check if user is logged in
app.get("/loggedin", function (req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});

// log out user
app.post("/logout", function (req, res) {
    req.logOut();
    res.send(200);
});

// register user
app.post("/register", function (req, res) {
    var newUser = req.body;
    UserModel.findOne({username: newUser.username}, function(err, user) {
        if(user) {
            res.status(401).send('Error: username is already in use');
        } else {
            var newUser = new UserModel(req.body);
            newUser.save(function(err, user) {
                req.login(user, function(err) {
                    if(err) { return next(err); }
                    res.json(user);
                });
            });
        }
    });

});

// get user info
app.get('/user/:username', function (req, res) {
    UserModel.findOne({ username: req.params.username }, function (err, user) {
        if (err || !user) {
            res.status(404).send('User not found.');
        } else {
            res.json(user);
        }
    });
});

// add user to friends
app.put('/friend', function (req, res) {
    var newFriend = req.body;
    UserModel.findOne({ username: req.user.username }, function (err, user) {
        var userFriends = user.friends;
        userFriends.push(newFriend.username);
        UserModel.update({ username: req.user.username }, { "friends": userFriends }, function (err, user) {
            req.user.friends = userFriends;
            res.send(req.user);
        });
    });
});

// remove user from friends
app.put('/unfriend', function (req, res) {
    var newUnfriend = req.body;
    UserModel.findOne({ username: req.user.username }, function (err, user) {
        var userFriends = user.friends;
        var unfriendIndex = userFriends.indexOf(newUnfriend);
        userFriends.splice(unfriendIndex, 1);
        UserModel.update({ username: req.user.username }, { "friends": userFriends }, function (err, user) {
            req.user.friends = userFriends;
            res.send(req.user);
        });
    });
})

app.listen(port, ip);
