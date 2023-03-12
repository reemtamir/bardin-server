const express = require('express');
const app = express();
const PORT = 3000;
const { connect } = require('./schema');
const http = require('http').Server(app);
const cors = require('cors');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/my-profile');
const adminRouter = require('./routes/admin');
const morgan = require('morgan');
//{ origin: 'https://reemtamir.github.io',}
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.text());
app.use(morgan('dev'));
const socketIO = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3002',
  },
});

connect();
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/me', profileRouter);
app.use('/admin', adminRouter);

// app.get('/api', (req, res) => {
//   console.log('api');
//   socketIO.on('connection', (socket) => {
//     console.log(`⚡: ${socket.id} user just connected!`);

//     socket.on('message', (data) => {
//       console.log('data', data);
//       socketIO.emit('messageResponse', data);
//     });

//     socket.on('typing', (data) =>
//       socket.broadcast.emit('typingResponse', data)
//     );

//     socket.on('newUser', (data) => {
//       console.log('data', data);
//       // names.push(data);

//       // console.log('users', names);

//       socketIO.emit('newUserResponse', data);
//     });

//     socket.on('disconnect', () => {
//       console.log('🔥: A user disconnected');

//       users = users.filter((user) => user.socketID !== socket.id);

//       socketIO.emit('newUserResponse', users);
//       socket.disconnect();
//     });
//   });
// });
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
