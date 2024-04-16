const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  nominee1: { type: Number, default: 0 },
  nominee2: { type: Number, default: 0 },
  nominee3: { type: Number, default: 0 },
  nominee4: { type: Number, default: 0 },
  nominee5: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 }
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
