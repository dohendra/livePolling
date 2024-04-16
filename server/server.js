const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Vote = require('./models/vote'); 
require('dotenv').config();

//database setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Express setup

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


app.post('/vote', async (req, res) => {
  if (!req.session.voted) {
    const { nominee } = req.body;
    try {
      const result = await Vote.findOneAndUpdate({}, { $inc: { [nominee]: 1, totalVotes: 1 } }, { new: true, upsert: true });
      req.session.voted = true;
      io.emit('updateVotes', result);
      res.send({ success: true, votes: result });
    } catch (error) {
      res.status(500).send({ success: false, message: 'Error updating vote' });
    }
  } else {
    res.status(403).send({ success: false, message: 'You have already voted' });
  }
});


app.get('/votes', async (req, res) => {
  try {
    const result = await Vote.findOne(); // Assuming there's only one voting record
    if (!result) {
      return res.status(404).send({ message: "No voting data found." });
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving votes" });
  }
});

io.on('connection', (socket) => {
  console.log('New connection: ' + socket.id);
  socket.emit('updateVotes', Vote);
  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
