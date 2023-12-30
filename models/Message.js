const mongoose = require("mongoose");

const Message = new mongoose.Schema({
    message: {
        type: [{
            text: String,
            sentById: mongoose.Types.ObjectId,
            sentBy: String,
            sentAt: Date,
        }],
        default: []
    },
    chatId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'chat'
    }
})

module.exports = mongoose.model("message", Message);