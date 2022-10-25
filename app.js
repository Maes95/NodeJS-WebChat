const express = require('express');
const app = express();
const SocketServer = require('ws').Server;
const http = require('http');
const server = http.createServer(app).listen(9000);

// To use serve files in "frontend"
app.use(express.static('frontend'));

// Set up SocketServer with Express
const wss = new SocketServer({ server });

// Set with the user names
var users = new Set();

function broadcast(room, message) {
    wss.clients.forEach((client) => { if (client.room == room) client.send(JSON.stringify(message)) });
}

wss.on('connection', (ws) => {

    ws.on('message', (data) => {
        var message = JSON.parse(data);
        if (message['message']) {
            // Normal message (broadcast it)
            broadcast(ws.room, message)
        } else {
            // First message (first connection)
            if (users.has(message['name'])) {
                ws.send(JSON.stringify({ type: "system", message: "User already exist" }));
                ws.close();
            } else {
                users.add(message['name']);
                ws['room'] = message['room'];
                ws['name'] = message['name'];
                broadcast(ws.room, { type: "system", message: "User " + ws['name'] + " has joined the room" })
            }
        }
    });

    ws.on('close', () => {
        users.delete(ws['name']);
        broadcast(ws.room, { type: "system", message: "User " + ws['name'] + " has disconnected" })
    });

});