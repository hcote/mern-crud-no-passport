require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const userRouter = require("./routes/user");
const cors = require("cors");
const app = express();
const db = require("./models/Connection");

app.use(cors({ credentials: true, origin: "http://localhost:3001" }));
app.set("trust proxy", 1);

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
      secure: false, // Uncomment this line to enforce HTTPS protocol.
      sameSite: false
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", userRouter);

const listener = app.listen(8080, function() {
  console.log("Listening on port " + listener.address().port);
});

/**
 * use a strategy when authenticating (i.e. signing up / logging in)
 *    this is the purpose of passport.authenticate("magic") in the /api/post
 * if authentication succeeds, req.user will be set
 */
