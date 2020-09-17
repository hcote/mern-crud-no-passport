require("dotenv").config(); // allow us to access process.env variables
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const userRouter = require("./routes/user");
const todoRouter = require("./routes/todo");
const path = require("path");
const cors = require("cors");
const app = express();
const db = require("./models/connection");

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
  })
);

app.use("/api/user", userRouter);
app.use("/api/todos", todoRouter);

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const listener = app.listen(process.env.PORT || 8080, function () {
  console.log("Listening on port " + listener.address().port);
});
