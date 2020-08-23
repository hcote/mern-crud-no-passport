const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const passport = require("passport");
const User = require("../models/User");
const { Magic } = require("@magic-sdk/admin");
const MagicStrategy = require("passport-magic").Strategy;

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

const strategy = new MagicStrategy(async function (user, done) {
  const userMetadata = await magic.users.getMetadataByIssuer(user.issuer);
  const existingUser = await User.findOne({ issuer: user.issuer });
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

/* calls our MagicStrategy when a user logs in */
passport.use(strategy);

const signup = async (user, userMetadata, done) => {
  let newUser = {
    email: userMetadata.email,
    issuer: user.issuer,
    lastLoginAt: user.claim.iat,
  };
  await new User(newUser).save();
  return done(null, newUser);
};

const login = async (user, done) => {
  /* Replay attack protection (https://go.magic.link/replay-attack) */
  if (user.claim.iat <= user.lastLoginAt) {
    return done(null, false, {
      message: `Replay attack detected for user ${user.issuer}}.`,
    });
  }
  let updatedUser = {
    issuer: user.issuer,
    lastLoginAt: user.claim.iat,
  };
  await User.updateOne({ issuer: updatedUser.issuer }, { $set: updatedUser });
  return done(null, user);
};

/* Defines what data/cookies are stored in the user session */
passport.serializeUser((user, done) => {
  done(null, user.issuer);
});

/* Populates user data in the req.user object */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ issuer: id });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authorized: false });
  } else {
    return res.json({ authorized: true, user: req.user });
  }
});

router.post("/login", passport.authenticate("magic"), async (req, res) => {
  /* strip token from Authorization header */
  let DIDT = req.headers.authorization.split(" ")[1];

  /* validate token to ensure request came from the issuer */
  await magic.token.validate(DIDT);

  /**
   * decode token to get claim obj with data, see https://docs.magic.link/admin-sdk/node-js/sdk/token-module/decode#returns
   *
   * `claim` will be in the form of
   * {
   * iat: 1595635806,
   * ext: 1595636706,
   * iss: 'did:ethr:0x84Ebf8BD2b35dA715A5351948f52ebcB57B7916A',
   * sub: 'LSZlrB5urQNFIXEXpTdVnI6BzwdJNJMlfqsEJvrCvRI=',
   * aud: 'did:magic:026e022c-9b57-42bf-95d4-997543be1c21',
   * nbf: 1595635806,
   * tid: 'aea69063-0665-41ca-a2e2-4ff36c734703',
   * add: '0xf6ee75197340d270156c25054a99edda0edfc0b491fe1b433c9360481c043992428c82ca8b341272ba81d8004ddfbf739dda2368743349db0b9f97f3293707aa1c'
   * }
   */
  let claim = magic.token.decode(DIDT)[1];

  /**
   * get user data from Magic
   *
   * `userMetadata` will be on the form of:
   * {
   * issuer: 'did:ethr:0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
   * publicAddress: '0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
   * email: 'example@gmail.com'
   * }
   */
  const userMetadata = await magic.users.getMetadataByIssuer(claim.iss);

  /* send back response with user obj */
  return res.json({ authorized: true, user: userMetadata });
});

router.get("/logout", (req, res) => {
  req.logout();
  return res.json({ authorized: false });
});

module.exports = router;