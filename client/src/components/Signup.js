import React, { useState } from "react";
import { serverUrl } from "../config/settings";
import "../styles/app.css";

function Signup({ m, onLogin, setTodos }) {
  const [email, setEmail] = useState("");

  /**
   * Login with Magic, which sends an email to the user
   * Unique Decentralized ID token is returned when the user clicks the email link
   * Then send the DID in the header as Authorization: Bearer <did>
   * Trigger the onLogin prop which sets the user email to isLoggedIn, triggering <Home /> to render
   * Set Todos with response from server containing that user's Todos
   */
  const login = async () => {
    let did = await m.auth.loginWithMagicLink({ email });
    let data = await loginRequestToServer(`${serverUrl}/user/login`, did);
    onLogin(email);
    setTodos(data.todos.todos);
  };

  /**
   * POST request to server with our DID token
   */
  const loginRequestToServer = (url, did) => {
    return fetch(url, {
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + did
      }),
      withCredentials: true,
      credentials: "include"
    }).then(res => res.json());
  };

  return (
    <div>
      <div className="signup-form">
        <h4 className="signup-form-header">Magic Todo List</h4>
        <form
          onSubmit={e => {
            e.preventDefault();
            login();
          }}
        >
          <input
            value={email}
            type="email"
            placeholder="Email..."
            className="signup-form-input"
            onChange={e => setEmail(e.target.value)}
          />
          <br />
          <input type="submit" value="Log in | Sign up" className="signup-form-submit-btn" />
        </form>
      </div>
    </div>
  );
}

export default Signup;
