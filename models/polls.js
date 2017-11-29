const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/* Create Poll */
let Polls = new mongoose.Schema({
  id:           ObjectId,
  title:        String,
  options:      Array,
  author:       String,
});

Polls.methods.createPoll = function createPoll(userChoice) {
    this.title = userChoice.title;
    this.author = userChoice.author;
    this.options = userChoice.choices[0].choice;
};
module.exports = mongoose.model('polls', Polls);
