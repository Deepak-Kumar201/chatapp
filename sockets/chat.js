const ChatList = require("../models/ChatList");
const Chats = require("../models/Chats");
const Message = require("../models/Message");
const User = require('../models/User');

const setRoom = (userId, socket) => {
    socket.join(userId);
}

const getUser = async (email, socket) => {
    console.log(email);
    const searchResult = await User.find({
        email: {
            $regex: email,
        }
    }, { email: 1, name: 1, profilePic: 1 }).limit(10);
    console.log(searchResult)
    socket.emit("search-user-result", searchResult);
}

const getChat = async (socket) => {
    const user = socket.user;
    const chatList = await ChatList.findOne({ userId: user._id }).populate("chats").lean();
    socket.emit("chat-list", chatList.chats);
}

const startChat = async (startWith, label, socket) => {
    const user = socket.user;
    const chat = new Chats({
        label: label,
        users: [user, startWith]
    });
    await chat.save();
    const message = new Message({
        chatId: chat._id
    })
    await message.save();
    await ChatList.updateMany({
        userId: {
            $in: [user._id, startWith._id]
        }
    }, {
        $push: {
            chats: chat._id
        }
    });

    socket.in(startWith._id).emit("new-chat");
    socket.emit("new-chat");
}

const sendMessage = async (chatId, userIds, message, socket) => {
    await Message.updateOne({ chatId: chatId }, {
        $push: {
            message: message
        }
    })
    userIds.forEach((id) => {
        socket.in(id).emit("new-message", chatId, message);
    })
}

const createGroup = async (users, label, socket) => {
    users = [...users, socket.user];
    console.log("creating group")
    const chat = new Chats({
        label: label,
        users: users,
        chatType: "group"
    });
    await chat.save();
    const message = new Message({
        chatId: chat._id
    })
    await message.save();
    await ChatList.updateMany({
        userId: {
            $in: users.map((user) => user._id)
        }
    }, {
        $push: {
            chats: chat._id
        }
    });

    users.forEach((user) => {
        if (user._id != socket.user._id) {
            socket.in(user._id).emit("new-chat");
        }
    })
    socket.emit("group-created");
    socket.emit("new-chat");
}

const joinGroup = async (_id, socket) => {
    await Chats.findByIdAndUpdate(_id, {
        $push: {
            users: socket.user
        }
    });
    await ChatList.findOneAndUpdate({ userId: socket.user._id }, {
        $push: {
            chats: _id
        }
    });
    const chat = await Chats.findById(_id);
    chat.users.forEach((user) => {
        if (user._id != socket.user._id) {
            socket.in(user._id).emit("new-chat");
        }
    })
    socket.emit("new-chat");
    socket.emit("group-joined");
}

const deleteChat = async (_id, socket) => {
    const chat = await Chats.findById(_id).lean();
    chat.users = chat.users.filter((user) => user._id.toString() != socket.user._id);
    await Chats.findByIdAndUpdate(_id, chat);
    const chatList = await ChatList.findOne({ userId: socket.user._id }).lean();
    chatList.chats = chatList.chats.filter((chat) => chat._id != _id);
    await ChatList.findOneAndUpdate({ userId: socket.user._id }, chatList);
    chat.users.forEach((user) => {
        socket.in(user._id).emit("new-chat");
    })
    socket.emit("new-chat");
}

const getMessage = async (chatId, socket) => {
    const messages = await Message.findOne({ chatId: chatId }).lean();
    socket.emit("requested-message", messages.message);
}

module.exports = { setRoom, getUser, getChat, startChat, sendMessage, createGroup, joinGroup, deleteChat, getMessage }