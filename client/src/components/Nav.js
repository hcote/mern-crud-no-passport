import React from "react";
import "../styles/app.css";
import Logout from "./Logout";

function Nav({ email, onLogout }) {
  return (
    <div className="nav">
      <div className="nav-user">{email ? `Welcome, ${email}` : null}</div>
      {email ? <Logout onLogout={onLogout} /> : null}
    </div>
  );
}

export default Nav;
