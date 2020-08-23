const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  todo: { type: String, required: true },
  completed: Boolean
});

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = Todo;
