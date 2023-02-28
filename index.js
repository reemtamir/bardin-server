const express = require('express');
const app = express();
const PORT = 3000;
const { connect, User } = require('./schema');
const http = require('http').Server(app);
const cors = require('cors');
const {
  getAlUsers,
  createUser,
  editUser,
  getUser,
  singIn,
  deleteUser,
} = require('./service');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.text());
const socketIO = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3001',
  },
});
let users = [];
let names = [];

connect();
app.post('/users', createUser);

app.put('/me/:email', editUser);

app.get('/users', getAlUsers);
app.get('/me/:email', getUser);

app.post('/auth', singIn);
app.delete('/delete/:email', deleteUser);

app.get('/api', (req, res) => {
  console.log('api');
  socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('message', (data) => {
      console.log('data', data);
      socketIO.emit('messageResponse', data);
    });

    socket.on('typing', (data) =>
      socket.broadcast.emit('typingResponse', data)
    );

    socket.on('newUser', (data) => {
      console.log('data', data);
      // names.push(data);

      // console.log('users', names);

      socketIO.emit('newUserResponse', data);
    });

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');

      users = users.filter((user) => user.socketID !== socket.id);

      socketIO.emit('newUserResponse', users);
      socket.disconnect();
    });
  });
});
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
