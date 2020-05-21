import React, { useState } from "react";

function Signup({ m, onLogin }) {
  const [email, setEmail] = useState("huntercote2@gmail.com");

  return (
    <div>
      <h4>Login / Signup</h4>
      {/* need  */}
      <form
        onSubmit={e => {
          e.preventDefault();
          console.log(email);
          m.auth.loginWithMagicLink({ email }).then(did => {
            onLogin(did);
          });
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
