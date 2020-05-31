import React, { useState } from "react";
import "../styles/app.css";

function Signup({ m, onLogin, setTodos }) {
  const [email, setEmail] = useState("huntercote2@gmail.com");

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

  const login = async () => {
    let did = await m.auth.loginWithMagicLink({ email });
    let data = await loginRequestToServer(`http://localhost:8080/api/user/login`, did);
    onLogin(email);
    setTodos(data.todos.todos);
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
            onChange={e => {
              setEmail(e.target.value);
            }}
          />
          <br />
          <input type="submit" value="Log in | Sign up" className="signup-form-submit-btn" />
        </form>
      </div>
    </div>
  );
}

export default Signup;
