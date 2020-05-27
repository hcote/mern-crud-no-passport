const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true },
  didToken: { type: String, required: true, unique: true },
  lastLoginAt: { type: Number, required: true },
  todos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Todo"
    }
  ]
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
