require("dotenv").config();
const express = require('express');
const app = express();
const path = require("path");
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3030
const userSocket = io.of('/user');
const chatSocket = io.of('/chat');
const mongoose = require('mongoose');
const { authUser, login } = require('./sockets/user');
const User = require('./models/User');
const jwt = require("jsonwebtoken");
const { isEmpty } = require("lodash");
const Chats = require('./models/Chats');
const Message = require('./models/Message');
const ChatList = require('./models/ChatList');
const { setRoom, getUser, getChat, startChat, sendMessage, createGroup, getMessage, deleteChat, joinGroup } = require('./sockets/chat');
const secret = process.env.JWT_SECRET;
const uri = process.env.MONGO_DB;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

mongoose.connect(uri).then(() => {
    console.log('connected to db');
}).catch((err) => {
    console.log(err);
})

app.use(express.static(path.join(__dirname, 'client/build')))
userSocket.on("connection", (socket) => {
    socket.on("auth", (data) => authUser(socket, data))
    socket.on("login", (data) => login(socket, data))
})

chatSocket.use(async (socket, next) => {
    const token = socket.handshake.query.token;
    if (!isEmpty(token)) {
        const { email } = jwt.verify(token, secret);
        const user = await User.findOne({ email: email }).lean();
        socket.user = user;
    }
    next();
})

chatSocket.on("connection", (socket) => {
    socket.on("join-room", (data) => setRoom(data, socket))
    socket.on("search-user", (data) => getUser(data, socket))
    socket.on("get-chats", () => getChat(socket))
    socket.on("start-chat", (user, label) => startChat(user, label, socket))
    socket.on("get-message", (chatId) => getMessage(chatId, socket))
    socket.on("send-message", (chatId, userIds, message) => sendMessage(chatId, userIds, message, socket))
    socket.on('create-group', (users, label) => createGroup(users, label, socket))
    socket.on("join-group", (_id) => joinGroup(_id, socket))
    socket.on("delete-chat", (_id) => deleteChat(_id, socket))
})