const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const passport = require("passport");
const User = require("../models/User");
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

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
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
  await User.updateOne({ didToken: updatedUser.didToken }, { $set: updatedUser });
  return done(null, user);
};

/* Defines what data/cookies are stored in the user session */
passport.serializeUser((user, done) => {
  done(null, user.issuer);
});

/* Populates user data in the req.user object */
passport.deserializeUser(async (id, done) => {
  try {
    done(null, await User.findOne({ didToken: id }));
  } catch (err) {
    done(err, null);
  }
});

function fetchTodos(id) {
  let user = User.findOne({ didToken: id })
    .populate("todos")
    .exec((err, todos) => todos);

  return user;
}

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
  }
  res
    .status(200)
    .json(req.user)
    .end();
});

router.post("/login", passport.authenticate("magic"), async (req, res) => {
  let didEncoded = req.headers.authorization.split(" ")[1];
  try {
    await magic.token.validate(didEncoded);
    let claim = magic.token.decode(didEncoded)[1];
    let todos = await User.findOne({ didToken: claim.iss }).populate("todos");
    res.json({
      claim,
      todos
    });
  } catch (err) {
    console.log(`Error: ${err}`);
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  res.json({ loggedOut: true });
});

module.exports = router;
