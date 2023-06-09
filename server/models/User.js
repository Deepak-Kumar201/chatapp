const mongoose = require("mongoose");

const UserModel = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	profilePic: {
		type: String,
		required: true
	}
})

module.exports = mongoose.model("user", UserModel);