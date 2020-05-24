const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const app = express();
const cors = require("cors");
const { Magic } = require("@magic-sdk/admin");

require("dotenv").config();
const db = require("./models/Connection");
const User = require("./models/User");

/* 1️⃣ Setup Magic Admin SDK */
const magic = new Magic(process.env.MAGIC_SECRET_KEY);

app.set("trust proxy", 1);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "not my cat's name",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: true, // set for HTTPS only
      sameSite: true
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ hello: "world" });
});

app.post("/api/login", passport.authenticate("magic"), (req, res) => {
  let didEncoded = req.headers.authorization.split(" ")[1];
  let [proof, claim] = magic.token.decode(didEncoded);
  console.log(claim.iss);
  res.json({ hello: "world" });
});

/* 2️⃣ Implement Auth Strategy */
const MagicStrategy = require("passport-magic").Strategy;

const strategy = new MagicStrategy(async function(user, done) {
  console.log(user);
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

/* 3️⃣ Implement Auth Behaviors */
const signup = async (user, userMetadata, done) => {
  console.log("sign up");
  console.log(user);
  console.log(userMetadata);
  let newUser = {
    email: userMetadata.email,
    didToken: user.issuer,
    lastLoginAt: user.claim.iat
  };
  await new User(newUser).save();
  return done(null, newUser);
};

const login = async (user, done) => {
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

/* 4️⃣ Implement Session Behavior */

/* Defines what data/cookies are stored in the user session */
passport.serializeUser((user, done) => {
  console.log("serializing");
  done(null, user.issuer);
});

/* Populates user data in the req.user object */
passport.deserializeUser(async (id, done) => {
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

/* 5️⃣ Implement User Endpoints */

/* Implement Get Data Endpoint */
app.get("/api/user", async (req, res) => {
  console.log(req.isAuthenticated());
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

// app.post("/user/buy-apple", async (req, res) => {
//   if (req.isAuthenticated()) {
//     await User.updateOne({ didToken: req.user.issuer }, { $inc: { apples: 1 } }, (err, updated) => {
//       if (err) console.log(err);
//       console.log(updated);
//     });
//     return res.status(200).end();
//   } else {
//     return res.status(401).end(`User is not logged in.`);
//   }
// });

/* Implement Logout Endpoint */
// app.post("/user/logout", async (req, res) => {
//   if (req.isAuthenticated()) {
//     await magic.users.logoutByIssuer(req.user.issuer);
//     req.logout();
//     return res.status(200).end();
//   } else {
//     return res.status(401).end(`User is not logged in.`);
//   }
// });

const listener = app.listen(process.env.PORT || 8080, () =>
  console.log("Listening on port " + listener.address().port)
);
