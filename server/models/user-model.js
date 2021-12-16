const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  email: { type: String, unique: true, requires: true },
  password: { type: String, requires: true },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
});

module.exports = model('User', UserSchema);
