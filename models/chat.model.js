const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  users: { type: [String], required: true },
  messages: {
    type: [
      {
        from: String,
        to: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
});

const Chat = mongoose.model('Chat', chatSchema, 'chats');

module.exports = {
  Chat,
};
