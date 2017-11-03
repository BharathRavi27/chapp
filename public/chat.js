// Make connection
var socket = io.connect('http://localhost:4000');
// var User = require('../models/user.js');
// var mongoose = require('mongoose');
// Query DOM
var message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      btn = document.getElementById('send'),
      output = document.getElementById('output'),
      feedback = document.getElementById('feedback');
//////
var loggedusername =document.getElementById('loggedusername').innerHTML;

// Emit events
btn.addEventListener('click', function(){
    socket.emit('chat', {
        message: message.value,
        loggeduser: loggedusername
    });
    message.value = "";
});

message.addEventListener('keypress', function(){
    socket.emit('typing', loggedusername);
});





// Listen for events
socket.on('chat', function(data){

    var newDiv = document.createElement('p');
    var newA = document.createElement('a');
    newA.textContent = data.message;
    newDiv.textContent = data.loggeduser + ":";
    var message = document.getElementById('chat-ul');
    message.appendChild(newDiv);
    newDiv.appendChild(newA);
    feedback.innerHTML = '';
    // output.innerHTML +=  data.handle + ': </strong>' + data.message + '</p>';
});

socket.on('typing', function(data){
    console.log('typing event')
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});


socket.on('prev', function(docs){
    console.log(docs.length);
    console.log(docs)
    //creating divs
    for (var x = 0 ; x < docs.length; x++) {
        console.log('how many time?',x);
        var newDiv = document.createElement('p');
        // newDiv.setAttribute('class', 'chat-para');
        var newA = document.createElement('a');
        newA.textContent = docs[x].message;
        newDiv.textContent = docs[x].username + ":";
        var message = document.getElementById('chat-ul');
        message.appendChild(newDiv);
        newDiv.appendChild(newA);
    }

    // output.innerHTML += '<p><strong>' + 'b' + ': </strong>' + docs[0].message + '</p>';
});
