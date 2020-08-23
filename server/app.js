require("dotenv").config(); // allow us to access process.env variables
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const userRouter = require("./routes/user");
const todoRouter = require("./routes/todo");
const cors = require("cors");
const app = express();
const db = require("./models/Connection");

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.ENCRYPTION_SECRET,
    resave: false, // don't resave session variables if nothing has changed
    saveUninitialized: true, // save empty value in session if there is no value
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: false, // set true for HTTPS only.
      sameSite: false
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/user", userRouter);
app.use("/api/todos", todoRouter);

const listener = app.listen(process.env.PORT || 8080, function() {
  console.log("Listening on port " + listener.address().port);
});
