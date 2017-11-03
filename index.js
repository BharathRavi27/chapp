var express = require('express');
var socket = require('socket.io');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var exphbs = require('express-handlebars');
var path = require('path');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes/index')
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');

var  Chat =  require('./models/chat');

//mongodb
mongoose.connect('mongodb://bharathravi:bharathravi123@ds239965.mlab.com:39965/chatappdb');
var db = mongoose.connection;
// App setup
var app = express();

app.set('port', (process.env.PORT || 4000));
var server = app.listen(app.get('port'), function(){
    console.log('listening for requests on port 4000,');
});

// Static files
app.use(express.static('public'));


// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));
// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Passport init
app.use(passport.initialize());
app.use(passport.session());
// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});
// Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));
  

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);
    var chat = db.collection('chats');
    Chat.find({ }.toArray, (err,docs) => {
        // console.log(docs);
        socket.emit('prev',docs);
    });

    // Handle chat event
    socket.on('chat', function(data){
        console.log(data);
        var newChat = new Chat ({
            username: data.loggeduser,
            message: data.message
        });
        newChat.save((docs) => {
            io.sockets.emit('chat', data);
        });
    });

    // Handle typing event
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });

});
app.use('/', routes);

// User.find({ }, (err,docs) => {
//     console.log(docs);
// });