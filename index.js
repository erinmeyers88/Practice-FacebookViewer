var express = require("express");
var session = require("express-session");
var passport = require("passport");
var FacebookStrategy = require("passport-facebook").Strategy;
var port = 3000;
var app = express();
var keys = require("./keys");


//Middleware
app.use(session({secret: "Secret for this practice app"}));  //used to encrypt cookie exchange between node server and clients

app.use(passport.initialize());

app.use(passport.session()); //Tells passport to sync up with our express session




passport.use(new FacebookStrategy({  //Use pascal case because it is to be used with the new key word
  clientID: keys.facebookId,
  clientSecret: keys.facebookSecret,
  callbackURL: 'http://localhost:3000/auth/facebook/callback'  //what to go back to after use authenticates
}, function(token, refreshToken, profile, done) {
  return done(null, profile);
}));



app.get("/auth/facebook", passport.authenticate("facebook"));

app.get("/auth/facebook/callback", passport.authenticate("facebook", {
	successRedirect: "/me",
	failureRedirect: "/login"
}), function (req, res) {
	console.log(req.session);
});


passport.serializeUser(function(user, done) {  //turns it into a basic data structure.  The function that is called by passport to allow you to modify data before you put it on session.
	//before data is put on to the session
	done(null, user);  //user is what is going to be put on the session (what we got back from facebook)
});


//require auth - can use this in other places
var requireAuth = function (req, res, next) {
	if(req.isAuthenticated()){  //isAuthenticated comes from passport
		return next();	
	} else {
	return res.redirect("/auth/facebook");
	}
};


passport.deserializeUser(function (obj, done) { //function called by passport after data is pulled from session.
	done(null, obj);
});





app.get("/me", requireAuth, function (req, res) {
	var currentLoggedInUserOnSession = req.user;
	console.log(req.session.user);
	res.send(currentLoggedInUserOnSession);
});




app.listen(port, function () {
	console.log("Listening on port " + port);
});
