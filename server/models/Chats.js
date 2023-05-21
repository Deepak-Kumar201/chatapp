const mongoose = require("mongoose");

const Chat = new mongoose.Schema({
	label: {
		type: String,
		required: true
	},
	users: {
		type: [{ name: String, userId: mongoose.Types.ObjectId, profilePic: String }],
		required: true
	},
	chatType: {
		type: String,
		enum: ['personal', 'group'],
		default: 'personal'
	}
})

module.exports = mongoose.model("chat", Chat);