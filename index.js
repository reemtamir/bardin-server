const express = require('express');
const app = express();
const PORT = 4000;

const http = require('http').createServer(app);
const { Server } = require('socket.io');
const socketIO = new Server(http);

const limiter = require('./middlewares/limiterMiddleware');

const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const chatRouter = require('./routes/chat');
const { User } = require('./models/user.model');
const { Chat } = require('./models/chat.model');
const { getUserBySocketId } = require('./controllers/user.controller');
const connectDB = async () => {
  return mongoose
    .connect('mongodb://127.0.0.1:27017/bardinDB')
    .then(() => console.log('connected to db'))
    .catch((err) => console.log(err));
};

mongoose.set('strictQuery', false);

app.use(cors());
//{ origin: 'https://reemtamir.github.io',}

// Apply the rate limit middleware to all requests
// app.use(limiter);

app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(morgan('dev'));

connectDB();

// Routers
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/me', profileRouter);
app.use('/admin', adminRouter);
app.use('/chat', chatRouter);

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
listen(socketIO);

function listen(socketServer) {
  socketServer.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('connection', async (data) => {
  
      await User.findOneAndUpdate(
        { email: data },
        {
          $set: {
            socketId: socket.id,
          },
        }
      );
      const email = data;
      socket.broadcast.emit('onLine', { email });
    });

    socket.on('typing', (data) => {
      socket.to(data.socketId).emit('typing', { userId: data.userId });
    });
    socket.on('notTyping', (data) => {
      socket.to(data.socketId).emit('notTyping');
    });

    socket.on('message', async (data) => {
      const { from, to, text } = data;
      if (!text) return;
      const users = [from, to];
      try {
        const chat = await Chat.findOne({ users: { $all: users } });

        const otherUser = await User.findOne({ email: to });
        const user = await User.findOne({ email: from });

        const update = await Chat.findByIdAndUpdate(
          { _id: chat._id },
          {
            $addToSet: {
              messages: { from, to, text },
            },
          },
          { new: true }
        );

        socket.to(otherUser.socketId).emit('messageResponse', {
          message: { from, to, text },
          chat: update._id,
          socketId: otherUser.socketId,
          sender: user,
        });
      } catch (error) {
        console.log(error);
      }
    });
    socket.on('offLine',  (email) => {
      socket.broadcast.emit('offLine', { email });
    });

    socket.on('disconnect',  () => {
      console.log(socket.id, '🔥🔥🔥: A user disconnected');
    });
  });
}
