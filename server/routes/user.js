const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const { Magic } = require("@magic-sdk/admin");
const MagicStrategy = require("passport-magic").Strategy;

const magic = new Magic("sk_test_97731B469E96BF31");

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
  console.log("here");
  try {
    console.log("id");
    console.log(id);
    const user = await User.findOne({ didToken: id });
    console.log("user");
    console.log(user);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

router.post("/login", passport.authenticate("magic"), async (req, res) => {
  let didEncoded = req.headers.authorization.split(" ")[1];
  let issuer = await magic.token.getIssuer(didEncoded);
  let [proof, claim] = magic.token.decode(didEncoded);
  req.session.user = claim;
  console.log(req.session);
  res.json({
    did: claim.iss
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
