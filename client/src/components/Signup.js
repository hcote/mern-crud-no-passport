import React, { useState } from "react";

function Signup({ m, onLogin }) {
  const [email, setEmail] = useState("huntercote2@gmail.com");

  const login = () => {
    m.auth.loginWithMagicLink({ email }).then(did => {
      fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: new Headers({
          Authorization: "Bearer " + did
        }),
        withCredentials: true,
        body: JSON.stringify({ email: email })
      })
        .then(res => res.json())
        .then(data => console.log(data));
      onLogin(did);
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
