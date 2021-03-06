var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var socket = require('socket.io');

var User = require('../models/user');


router.get('/login', (req,res) =>{
    res.render('login');
});
// router.get('/', (req,res) =>{
//     res.render('index');
// })



router.get('/', ensureAuthenticated, function(req, res){
	res.render('index',{loggedUser:global.loggedUser});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/login');
	}
}

passport.use(new LocalStrategy(
    function(username, password, done) {
     User.getUserByUsername(username, function(err, user){
         if(err) throw err;
         if(!user){
             return done(null, false, {message: 'Unknown User'});
         }
  
         User.comparePassword(password, user.password, function(err, isMatch){
             if(err) throw err;
             if(isMatch){
                 return done(null, user);
             } else {
                 return done(null, false, {message: 'Invalid password'});
             }
         });
     });
    }));
  
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        /////////////////
        global.loggedUser =  user.username;
      done(err, user);
    });
  });
  
  router.post('/login',
    passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login',failureFlash: true}),
    function(err, user) {
        console.log(user);
    });
    // Register
router.get('/register', function(req, res){
	res.render('register');
});
router.post('/register', function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors:errors
        });
    } else {
        var newUser = new User({
            name: name,
            email:email,
            username: username,
            password: password
        });

        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login');

        res.redirect('/login');
    }
});
module.exports = router;
