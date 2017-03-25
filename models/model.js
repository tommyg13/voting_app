const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/* Create User model */
module.exports.User = mongoose.model('User', new Schema({
  id:           ObjectId,
  username:    { type: String, required: '{PATH} is required.' },
  email:        { type: String, required: '{PATH} is required.', unique: true },
  password:     { type: String, required: '{PATH} is required.' },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}));
