const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Todo = require("../models/Todo");
const bodyParser = require("body-parser");
const { decryptCookie } = require("../cookie");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * GET all todos in db
 */
router.get("/", async (req, res) => {
  let userFromCookie;

  try {
    /* extract user from cookie */
    userFromCookie = await decryptCookie(req.cookies.auth);

    /* get user from DB */
    const user = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");
    // const user = await User.find({});

    /* send back response with user obj */
    return res.json({ authorized: true, user });
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.status(401).json({ authorized: false, error });
  }
});

/**
 * CREATE todo in DB
 */
router.post("/", async (req, res) => {
  let userFromCookie;

  try {
    /* extract user from cookie */
    userFromCookie = await decryptCookie(req.cookies.auth);

    /* create new Todo */
    const newTodo = new Todo({ todo: req.body.formTodo, completed: false });

    /* save Todo */
    const savedTodo = await newTodo.save();

    /* find user in DB */
    let userFromDb = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");

    /* add new todo to user's array of todos */
    userFromDb.todos.push(savedTodo);

    /* save user */
    await userFromDb.save();

    /* send back res with saved todo */
    return res.json({ authorized: true, todos: userFromDb.todos });
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.status(401).json({ authorized: false, error });
  }
});

/**
 * UPDATE todo (toggle completed/not completed)
 */
router.put("/update/:id", async (req, res) => {
  let userFromCookie;

  try {
    /* extract user from cookie */
    userFromCookie = await decryptCookie(req.cookies.auth);

    /* update Todo (completed/not completed) */
    await Todo.updateOne({ _id: req.params.id }, { $set: { completed: req.body.completed } });

    console.log("e");

    /* grab user */
    let user = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");

    /* return user */
    return res.json({ authorized: true, user });
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.json({ authorized: false, error });
  }
});

/**
 * DELETE todo from database
 */
router.delete("/delete/:id", async (req, res) => {
  let userFromCookie;

  try {
    /* extract user from cookie */
    userFromCookie = await decryptCookie(req.cookies.auth);

    /* get user from DB */
    const user = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");

    /* delete Todo */
    await Todo.deleteOne({ _id: req.params.id });

    /* remove Todo from user's `todos` array */
    user.todos = user.todos.filter((t) => t._id !== req.params.id);

    /* save user */
    await user.save();

    /* send back response noting the user was authorized to delete this todo */
    return res.json({ authorized: true });
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.json({ authorized: false, error });
  }
});

module.exports = router;
