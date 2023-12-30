const mongoose = require("mongoose");

const ChatList = new mongoose.Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'user'
	},
	chats: {
		type: [
			mongoose.Types.ObjectId
		],
		default: [],
		ref: 'chat'
	}
})

module.exports = mongoose.model("chatlist", ChatList);