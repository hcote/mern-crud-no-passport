const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true },
  issuer: { type: String, required: true, unique: true }, // did:ethr:public_address
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
