const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: 'verysecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // for HTTP; use `secure: true` for HTTPS
}));

// Store votes in memory for simplicity (you would use a database in production)
let votes = {
  nominees: {
    nominee1: 0,
    nominee2: 0,
    nominee3: 0,
    nominee4: 0,
    nominee5: 0
  },
  totalVotes: 0
};

app.post('/vote', (req, res) => {
  if (!req.session.voted) {
    const { nominee } = req.body;
    if (votes.nominees[nominee] !== undefined) {
      votes.nominees[nominee]++;
      votes.totalVotes++;
      req.session.voted = true;
      io.emit('updateVotes', votes);
      res.send({ success: true, votes });
    } else {
      res.status(400).send({ success: false, message: 'Invalid nominee' });
    }
  } else {
    res.status(403).send({ success: false, message: 'You have already voted' });
  }
});

app.get('/votes', (req, res) => {
  res.send(votes);
});

io.on('connection', (socket) => {
  console.log('New connection: ' + socket.id);
  socket.emit('updateVotes', votes);

  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
