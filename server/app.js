const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const app = express();
require("dotenv").config();
const { Magic } = require("@magic-sdk/admin");
const MAGIC_PUBLISHABLE_KEY = process.env.MAGIC_PUBLISHABLE_KEY;
const db = require("./models/Connection");
const User = require("./models/User");
/* 1️⃣ Setup Magic Admin SDK */
const magic = new Magic(process.env.MAGIC_SECRET_KEY);

const Datastore = require("nedb-promise");
let users = new Datastore({ filename: "users.db", autoload: true });

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "not my cat's name",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
      // secure: true,
      sameSite: true
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// GET home page
app.get("/", (req, res) => {
  res.render("index", { title: "Magic Apple Store 🍎", MAGIC_PUBLISHABLE_KEY });
});

/* 2️⃣ Implement Auth Strategy */
const MagicStrategy = require("passport-magic").Strategy;

const strategy = new MagicStrategy(async function(user, done) {
  const userMetadata = await magic.users.getMetadataByIssuer(user.issuer);
  const existingUser = await User.findOne({ didToken: user.issuer });
  if (!existingUser) {
    /* Create new user if doesn't exist */
    return mongoSignup(user, userMetadata, done);
  } else {
    /* Login user if otherwise */
    return mongoLogin(user, done);
  }
});

passport.use(strategy);

/* 3️⃣ Implement Auth Behaviors */
const mongoSignup = async (user, userMetadata, done) => {
  console.log("sign up");
  console.log(user);
  console.log(userMetadata);
  let newUser = {
    email: userMetadata.email,
    didToken: user.issuer,
    lastLoginAt: user.claim.iat
  };
  new User(newUser).save().then(savedNewUser => {
    console.log(savedNewUser);
  });
  // await users.insert(newUser);
  return done(null, newUser);
};

/* Implement User Signup */
const signup = async (user, userMetadata, done) => {
  console.log("sign up");
  console.log(user);
  console.log(userMetadata);
  let newUser = {
    issuer: user.issuer,
    lastLoginAt: user.claim.iat
  };
  await users.insert(newUser);
  return done(null, newUser);
};

const mongoLogin = async (user, done) => {
  console.log("login");
  console.log(user);

  let updatedUser = {
    didToken: user.issuer,
    lastLoginAt: user.claim.iat
  };
  await User.updateOne(
    { didToken: updatedUser.didToken },
    { $set: updatedUser },
    (err, updated) => {
      if (err) console.log(err);
      console.log(updated);
    }
  );
  return done(null, user);
};

/* Implement User Login */
const login = async (user, done) => {
  console.log("login");
  console.log(user);
  /* Replay attack protection (https://go.magic.link/replay-attack) */
  if (user.claim.iat <= user.lastLoginAt) {
    return done(null, false, {
      message: `Replay attack detected for user ${user.issuer}}.`
    });
  }
  await users.update({ issuer: user.issuer }, { $set: { lastLoginAt: user.claim.iat } });
  return done(null, user);
};

/* Attach middleware to login endpoint */
app.post("/user/login", passport.authenticate("magic"), (req, res) => {
  if (req.user) {
    res.status(200).end("User is logged in.");
  } else {
    return res.status(401).end("Could not log user in.");
  }
});

/* 4️⃣ Implement Session Behavior */

/* Defines what data are stored in the user session */
passport.serializeUser((user, done) => {
  done(null, user.issuer);
});

/* Populates user data in the req.user object */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await users.findOne({ issuer: id });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

/* 5️⃣ Implement User Endpoints */

/* Implement Get Data Endpoint */
app.get("/user", async (req, res) => {
  if (req.isAuthenticated()) {
    return res
      .status(200)
      .json(req.user)
      .end();
  } else {
    return res.status(401).end(`User is not logged in.`);
  }
});

/* Implement Buy Apple Endpoint */
// app.post("/user/buy-apple", async (req, res) => {
//   if (req.isAuthenticated()) {
//     await users.update({ issuer: req.user.issuer }, { $inc: { appleCount: 1 } });
//     return res.status(200).end();
//   } else {
//     return res.status(401).end(`User is not logged in.`);
//   }
// });

app.post("/user/buy-apple", async (req, res) => {
  if (req.isAuthenticated()) {
    await User.updateOne({ didToken: req.user.issuer }, { $inc: { apples: 1 } }, (err, updated) => {
      if (err) console.log(err);
      console.log(updated);
    });
    return res.status(200).end();
  } else {
    return res.status(401).end(`User is not logged in.`);
  }
});

/* Implement Logout Endpoint */
app.post("/user/logout", async (req, res) => {
  if (req.isAuthenticated()) {
    await magic.users.logoutByIssuer(req.user.issuer);
    req.logout();
    return res.status(200).end();
  } else {
    return res.status(401).end(`User is not logged in.`);
  }
});

const listener = app.listen(process.env.PORT || 8080, () =>
  console.log("Listening on port " + listener.address().port)
);
