import React from "react";
import "../styles/app.css";
import Logout from "./Logout";

function Nav({ isLoggedIn, onLogout }) {
  return (
    <div className="nav">
      <div className="nav-user">{isLoggedIn ? `Welcome, ${isLoggedIn}` : null}</div>
      {isLoggedIn ? <Logout onLogout={onLogout} /> : null}
    </div>
  );
}

export default Nav;
