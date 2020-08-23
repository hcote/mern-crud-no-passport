const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Todo = require("../models/Todo");
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * GET all todos in db
 */
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authorized: false });
  } else {
    try {
      /* get user from DB */
      let user = await User.findOne({ issuer: req.session.passport.user }).populate("todos");
  
      /* send back response with user obj */
      return res.json({ authorized: true, user });
    } catch (error) {
      /* if error, send back error */
      return res.json({ authorized: false, error });
    }
  }
});

/**
 * CREATE todo in DB
 */
router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authorized: false });
  } else {
    try {
      /* if the todo is empty, return an error */
      if (!req.body.formTodo.length)
        return res.json({ authorized: true, error: "Form cannot be empty" });

      /* create new Todo */
      let newTodo = new Todo({ todo: req.body.formTodo, completed: false });
      /* save Todo */
      let savedTodo = await newTodo.save();

      /* find user in DB */
      let user = await User.findOne({ issuer: req.session.passport.user }).populate("todos");
      /* add new todo to user's array of todos */
      user.todos.push(savedTodo);
      /* save user */
      await user.save();
      /* send back res with saved todo */
      res.json({ authorized: true, todos: user.todos });
    } catch (error) {
      /* if error, send back error */
      return res.json({ authorized: false, error });
    }
  }
});

router.put("/update/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authorized: false });
  } else {
    try {
      /* update Todo (completed/not completed) */
      await Todo.updateOne({ _id: req.params.id }, { $set: { completed: req.body.completed } });
  
      /* grab user */
      let user = await User.findOne({ issuer: req.session.passport.user }).populate("todos");
      /* return user */
      return res.json({ authorized: true, user });
    } catch (error) {
      /* if error, send back error */
      return res.json({ authorized: false, error });
    }
  }
});

router.delete("/delete/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authorized: false });
  } else {
    try {
      /* get user from DB */
      const user = await User.findOne({ issuer: req.session.passport.user }).populate("todos");
      
      /* delete Todo */
      await Todo.deleteOne({ _id: req.params.id });
  
      /* remove Todo from user's `todos` array */
      user.todos = user.todos.filter((t) => t._id !== req.params.id);
  
      /* save user */
      await user.save();
  
      /* send back response noting the user was authorized to delete this todo */
      return res.json({ authorized: true });
    } catch (error) {
      /* if error, send back error */
      return res.json({ authorized: false, error });
    }
  }
});

module.exports = router;