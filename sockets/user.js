
const { isEmpty } = require('lodash');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const ChatList = require('../models/ChatList');
const secret = process.env.JWT_SECRET;

const authUser = async (socket, token) => {
    try {
        const { email } = jwt.verify(token, secret);
        const user = await User.findOne({ email: email }).lean();
        if (isEmpty(user)) throw new Error("Invalid token");
        socket.emit("auth-success", user);
    } catch (err) {
        console.log(err, token)
        socket.emit("auth-error", "Invalid token");
    }
}

const login = async (socket, userData) => {
    try {
        let user = await User.findOne({ email: userData.email });
        if (isEmpty(user)) {
            user = {
                email: userData.email,
                name: userData.displayName,
                profilePic: userData.photoURL
            }
            const newUser = new User(user)
            await newUser.save();
            const newChatList = new ChatList({
                userId: newUser._id
            });
            await newChatList.save();
        }
        const token = jwt.sign({ email: user.email }, secret);
        socket.emit("login-success", token);
    } catch (error) {
        console.log(error)
    }
}

module.exports = { authUser, login }