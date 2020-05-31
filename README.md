### Magic Todo List

See it live at <a href="#">github.io</a>

### Technologies

Mongo
Express
Node
React (hooks)
Magic (authentication SDK)
Passportjs

The <code>master</code> branch uses contextAPI for state management. If you want a version that doesn't use that hook, clone down the non-contextAPI branch.

### Overview

Anyone can clone this down and have an outofthebox passwordless application ready to go with CRUD capabilities.

#### Flow

1. User submits the login form
2. Magic sends an email to the user
3. When the email link is clicked, <code>m.auth.loginWithMagicLink({ email })</code> resolves to a unique Decentralized ID token, which is sent in a POST request to the server (read more about <a href="">DID tokens</a>)
4. We validate the authenticity of the did token (sent in the <code>Authorization: Bearer < token ></code>) Magic's server-side SDK
5. If valid, we create a new user in Mongo if it's the first time authenticating, or logs a user in if they already have an account
6. Passport issues a cookie that lives in <code>request.session</code> to authorize all additional requests to the server

##### Managing Sessions

Magic's SDK is used for authentication, then passportjs handles the authorization and session management. When setting the cookie:

<code>
app.use(
  session({
    secret: "your_secret_here",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: false, // set true for HTTPS only.
      sameSite: false
    }
  })
);
</code>

Change the maxAge to how long you want the user session to last. Each time they make an authorized request to the server, the cookie age will reset and

When testing on localhost, the connection is over http so we keep secure: false. Read more about session management with Express Session <a href="">here</a>.

### Getting Project Started Locally

<code>\$ git clone < repo_name > </code>

Terminal Tab 1 (set up client)
<code>$ cd client</code><br />
<code>$ npm i</code><br />
<code>$ cd src</code><br />
<code>$ mkdir settings</code><br />
<code>\$ cd settings && touch config</code><br />

<div>See Environment Variables > Client section below</div><br />
<code>$ cd ../../</code><br />
<code>$ npm run start</code><br />

Terminal Tab 2 (set up server)
<code>$ cd server</code><br />
<code>$ npm i</code><br />
<code>\$ touch .env</code><br />

<div>See Environment Variables > Server section below</div><br />
<code>$ nodemon</code> This will start the server on port 8080

#### Mongo Database

This is set up using Mongo DB Atlas, which is a free cloud-based mongo database. I will not go into setting this up but you can follow one of the many tutorials on YouTube.

### Environment Variables

#### Client

<p>Enter this in client/src/settings/config.js</p>
<code>const settings = {
  MAGIC_PUBLISHABLE_KEY: "your_publishable_key",
  serverUrl: "server_url" // http://localhost:8080
};</code>

module.exports = settings;

#### Server

<p>Enter this in your server/.env file</p>
<code>
MAGIC_PUBLISHABLE_KEY=your_publishable_key
MAGIC_SECRET_KEY=your_secret_key
mongoURI=your_mongo_URL
CLIENT_URL=client_url (i.e. http://localhost:3000)</code>

### Errors

If you experience errors installing dependencies, change your Node and Npm versions to the ones below:
Node: 10.15.10
Npm: 6.4.1
