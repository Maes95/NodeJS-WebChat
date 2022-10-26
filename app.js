const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app).listen(9000);

const { Server } = require("socket.io");
const io = new Server(server);

// To use serve files in "frontend"
app.use(express.static('frontend'));

// Set with the user names
var users = new Set();

io.on('connection', (socket) => {

    // Recive messages from Client
    socket.on('message', (data) => {
        io.to(data['room']).emit("message", data);
    });

    // Recive event "new-user"
    socket.on('new-user', (message) => {
        if (users.has(message['name'])) {
            socket.emit('system-message', { message: "User already exist. Disconnected" });
            socket.disconnect();
        } else {
            users.add(message['name']);
            socket.join(message['room']);
            socket['room'] = message['room'];
            socket['name'] = message['name'];
            io.to(socket['room']).emit("system-message", { message: "User " + socket['name'] + " has joined the room" });
        }
    });

    // When client disconnects
    socket.on('disconnect', () => {
        users.delete(socket['name']);
        io.to(socket['room']).emit("system-message", { message: "User " + socket['name'] + " has left the room" });
    });

});