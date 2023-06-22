const { Chat } = require('../models/chat.model');

const getChat = async (req, res) => {
  try {
    const first = req.body[0].email;
    const second = req.body[1].email;

    const users = [first, second];
    const chat = await Chat.findOne({ users: { $all: users } });

    res.send(chat);
  } catch (error) {
    return;
  }
};

const createChat = async (req, res) => {
    let chat = await Chat.findOne({ users: { $all: req.body } });
    if (chat) {
      res.send(chat);
    } else {
      try {
        chat = await new Chat({
          users: req.body,
        }).save();
  
        res.send(chat);
      } catch (error) {
        res.status(400).send(error);
      }
    }
  };
  
module.exports = {
  getChat,createChat
};
