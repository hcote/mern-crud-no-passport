const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Todo = require("../models/Todo");
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/all-todos", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
  }
  let todos = await User.findOne({ issuer: req.session.passport.user }).populate("todos");
  res.json(todos);
});

router.post("/add-todo", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
  }
  if (!req.body.todo.length) return;
  let todoObj = new Todo({ todo: req.body.todo });
  let savedTodo = await todoObj.save();
  try {
    let user = await User.findOne({ issuer: req.session.passport.user });
    user.todos.push(savedTodo);
    await user.save();
    res.json({ todo: savedTodo });
  } catch (err) {
    console.log(`Error adding todo: ${err}`);
  }
});

router.get("/delete-todo/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
  }
  let todoId = req.params.id;
  let did = req.session.passport.user;
  let user = await User.findOne({ issuer: did }).populate("todos");
  user.todos = user.todos.filter(t => t._id !== todoId);
  await Todo.deleteOne({ _id: todoId });
  await user.save();
  res.json({ user });
});

module.exports = router;
