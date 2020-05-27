const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const Todo = require("../models/Todo");
const { Magic } = require("@magic-sdk/admin");
const MagicStrategy = require("passport-magic").Strategy;

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

const strategy = new MagicStrategy(async (user, done) => {
  const userMetadata = await magic.users.getMetadataByIssuer(user.issuer);
  const existingUser = await User.findOne({ didToken: user.issuer });
  if (!existingUser) {
    /* Create new user if doesn't exist */
    return signup(user, userMetadata, done);
  } else {
    /* Login user if otherwise */
    return login(user, done);
  }
});

passport.use(strategy);

const signup = async (user, userMetadata, done) => {
  let newUser = {
    email: userMetadata.email,
    didToken: user.issuer,
    lastLoginAt: user.claim.iat
  };
  await new User(newUser).save();
  return done(null, newUser);
};

const login = async (user, done) => {
  let updatedUser = {
    didToken: user.issuer,
    lastLoginAt: user.claim.iat
  };
  await User.updateOne(
    { didToken: updatedUser.didToken },
    { $set: updatedUser },
    (err, updated) => {
      if (err) console.log(err);
    }
  );
  return done(null, user);
};

/* Defines what data/cookies are stored in the user session */
passport.serializeUser((user, done) => {
  done(null, user.issuer);
});

/* Populates user data in the req.user object */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ didToken: id });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

async function fetchTodos(id) {
  const user = await User.findOne({ didToken: id })
    .populate("todos")
    .exec((err, todos) => todos);
  console.log(user);
}

router.post("/login", passport.authenticate("magic"), async (req, res) => {
  let didEncoded = req.headers.authorization.split(" ")[1];
  let issuer = await magic.token.getIssuer(didEncoded);
  let [proof, claim] = magic.token.decode(didEncoded);
  // let todos = fetchTodos(claim.iss);

  res.json({
    claim
  });
});

router.post("/todo", async (req, res) => {
  console.log(req.isAuthenticated());
  console.log(req.body);
  if (!req.isAuthenticated()) return;
  let todoObj = new Todo({ todo: req.body.todo });
  todoObj.save().then(savedTodo => {
    User.findOne({ didToken: req.session.passport.user }, (err, user) => {
      console.log(user);
      user.todos.push(savedTodo);
      user.save().then(saved => {
        res.json({ msg: `Saved: ${savedTodo}` });
      });
    });
  });
});

router.get("/user", async (req, res) => {
  console.log(req.session);
  if (req.isAuthenticated()) {
    return res
      .status(200)
      .json(req.user)
      .end();
  } else {
    return res.status(401).end(`User is not logged in.`);
  }
});

module.exports = router;
