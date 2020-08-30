### Heroku Instructions

`client/.env`

`.env`

Magic Live API keys

Ensure .env files are not being ignored by .gitignore

Procfile

app.js function (// Serve static assets if in production)

package.json

```
$ heroku create
$ git add .
$ git commit -m 'heroku commit'
$ git push heroku master
```

### Demo

Live at https://react-magic-todo-cookies.herokuapp.com/

## Quick Start

```
$ git clone <repo>

$ cd <repo_folder_name>

$ npm i

.....
```

#### Environment Variables

- Get your Magic API keys from the <a href="https://dashboard.magic.link">Dashboard</a>

- This example uses MongoDB Atlas, which provides a free cloud instance of Mongo that is very easy to connect to. Visit their <a href="https://account.mongodb.com/account/register">website</a> to create an account. Once you go through the setup steps, click "Connect your Application" to grab the URI.

`/client/.env` for your client-side environment variables.

```

```

`/.env` for your server-side environment variables.

```

```

# Tutorial

### Introduction

This tutorial will give a brief overview of how to integrate Magic into a full stack application (React, Node, MongoDB).

### Building the Application

```
$ npx create-react-app react-magic-todo
```

### Login

The `Login` component will allow the user to authenticate with Magic. The sequence of events is:

- User enters their email and clicks "Log in"
- An email containing a magic link is sent to the user, triggered by `magic.auth.loginWithMagicLink({ email });`
- User clicks the email link
- `loginWithMagicLink()` resolves to a unique `DID token`
- A `POST` request is sent to the database with the `DID` inside the `Authorization Header`
- Server validates the `DID`, creates a user based on `getMetadata()`, and responds back to the client `{ authorized: true, user: user }`
- `setLoggedIn` is set to the user object returned by the server
- Redirect to home page

```javascript
// components/Login.js
import React, { useContext, useState } from "react";
import { MagicContext, LoggedInContext, LoadingContext } from "./Store";
import { Link } from "react-router-dom";
import loadingGif from "../images/loading.gif";
import "../styles/login.css";

const Login = (props) => {
  const [loggedIn, setLoggedIn] = useContext(LoggedInContext);
  const [isLoading] = useContext(LoadingContext);
  const [email, setEmail] = useState("");
  const [magic] = useContext(MagicContext);
  const [errorMsg, setErrorMsg] = useState("");
  const [disableLogin, setDisableLogin] = useState(false);

  const authenticateWithDb = async (DIDT) => {
    /* Pass the Decentralized ID token in the Authorization header to the database */
    let res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/login`, {
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + DIDT,
      }),
      credentials: "include",
    });

    let data = await res.json();

    /* If the user is authorized, return an object containing the user properties (issuer, publicAddress, email) */
    /* Else, the login was not successful and return false */
    return data.authorized ? data.user : false;
  };

  const handleLogin = async () => {
    try {
      /* disable the login button to prevent users from clicking it multiple times, triggering mutliple emails */
      setDisableLogin(true);

      /* Get DID Token returned from when the email link is clicked */
      const DIDT = await magic.auth.loginWithMagicLink({ email });

      /* `user` will be the user object returned from the db, or `false` if the login failed */
      let user = await authenticateWithDb(DIDT);

      if (user) {
        setLoggedIn(user.email);
        return props.history.push("/");
      }
    } catch (err) {
      /* If the user clicked "cancel", allow them to click the login again */
      setDisableLogin(false);

      /* Handle error (which can occur if the user clicks `Cancel` on the modal after submitting their email) */
      console.log(`Error logging in with Magic, ${err}`);
    }
  };

  return (
    <>
      {isLoading ? ( // if fetching data, show a loading symbol
        <img
          className="loading-gif"
          src={loadingGif}
          alt="loading..."
          height="35px"
          alt="Loading..."
        />
      ) : loggedIn ? ( // If the user is logged in, show a link to the home page
        <>
          You're already logged in! Click <Link to="/">here</Link> to view your Todos.
        </>
      ) : (
        <div className="login-form">
          <h4 className="login-form-header">Enter Your Email</h4>
          <form>{/* form for login here */}</form>
        </div>
      )}
    </>
  );
};

export default Login;
```

### Customizing the UI

Magic allows you to own your UI. You can hide the modal after a user clicks Log In with `await loginWithMagicLink({ email, showUI: false })`. If you are on the <a href="https://magic.link/pricing">Starter Plan</a>, you can also customize the modal and email by adding your logo and choosing the style colors. Navigate to the <a href="https://dashboard.magic.link">Magic Dashboard</a> --> "Custom Branding".

### Handling Login Server-side

In `/pages/api/user/login.js` we handle POST requests to authenticate the user with our database. Once we validate the `DID token` and create a new user in the database, we have to issue a cookie to track our user sessions.

```javascript
// routes/user.js
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
```

### Deploying the app with Heroku
