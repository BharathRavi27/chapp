var mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
    username: String,
    message: String
});


var Chat = module.exports = mongoose.model('Chat', ChatSchema);