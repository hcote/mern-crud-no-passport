const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true },
  didToken: { type: String, required: true },
  lastLoginAt: { type: Number, required: true },
  apples: { type: Number, required: false, default: 0 }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
