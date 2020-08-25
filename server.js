const express = require('express');
const { v4 : uuidv4 } = require('uuid');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

// peerServer for '/peerjs' route

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs');
app.use(express.static('public'));







// Routes 
// There is basically 1 route which gets redirected to a unique route where the room is created.

app.get('/', (req,res)=>{
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room', (req,res)=>{
    res.render('room', { roomId : req.params.room });
})

io.on('connection', (socket)=>{
    // Now here we need to tell the script.js that we have joined the room.
    socket.on('join-room', (roomId, userId)=>{
        // Here we are joining into roomId
        socket.join(roomId);
        // Here we are telling everyone of that roomId to that we have joined
        socket.to(roomId).broadcast.emit('user-connected',userId);
        // Listening to the messages sent in chat
        socket.on('message', (message)=>{
            // Sending to everyone in the roomId including us
            io.to(roomId).emit('create-message', message);
        })
    })
    
})



server.listen(3000, ()=>{
    console.log(`Server started on 3000.`);
})
