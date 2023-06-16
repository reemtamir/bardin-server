const express = require('express');
const app = express();
const PORT = 4000;
const http = require('http').Server(app);
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

const socketIO = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3002',
  },
});

// Routers
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

// Connect to database
connectDB();

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
