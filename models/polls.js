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

let Poll = module.exports = mongoose.model('polls', Polls);

module.exports.createPoll = (newPoll, callback)=> {
    newPoll.save(callback);
};