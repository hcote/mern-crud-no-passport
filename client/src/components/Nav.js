import React from "react";
import "../styles/app.css";

function Nav({ issuer, m, onLogout, didEncoded }) {
  return (
    <div className="loggedin-nav">
      <div className="loggedin-nav-user">{issuer ? `Welcome, ${issuer.email}` : null}</div>
      <input
        type="submit"
        value="Logout"
        className="logout-btn"
        onClick={async e => {
          e.preventDefault();
          await m.user.logout();
          onLogout(true);
        }}
      />
      {/* <input
        type="submit"
        value="Get User"
        onClick={e => {
          e.preventDefault();
          fetch("http://localhost:8080/api/user", {
            method: "GET",
            headers: new Headers({
              Authorization: "Bearer " + didEncoded,
              "Content-Type": "application/json"
            }),
            withCredentials: true,
            credentials: "include"
          })
            .then(res => res.json())
            .then(data => console.log(data));
        }}
      /> */}
    </div>
  );
}

export default Nav;
