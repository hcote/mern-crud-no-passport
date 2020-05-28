import React, { useState } from "react";
import "../styles/app.css";

function Signup({ m, onLogin, setTodos }) {
  const [email, setEmail] = useState("huntercote2@gmail.com");

  const login = () => {
    m.auth.loginWithMagicLink({ email }).then(did => {
      fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: new Headers({
          Authorization: "Bearer " + did
        }),
        withCredentials: true,
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          onLogin(data.claim);
          setTodos(data.todos.todos);
        });
    });
  };

  return (
    <div>
      <h4>Login / Signup</h4>
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
          onChange={e => {
            setEmail(e.target.value);
          }}
        />
      </form>
    </div>
  );
}

export default Signup;
