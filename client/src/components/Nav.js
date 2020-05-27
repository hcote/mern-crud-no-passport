import React from "react";
import "../styles/app.css";

function Nav({ issuer, m, onLogout, didEncoded }) {
  // fetch("http://localhost:8080/api/user")
  //   .then(res => res.json())
  //   .then(data => console.log(data));

  return (
    <div className="App">
      <div>{issuer ? `Welcome, ${issuer.email}` : null}</div>
      <input
        type="submit"
        value="Logout"
        onClick={e => {
          e.preventDefault();
          m.user.logout();
          m.user.isLoggedIn().then(bool => {
            !bool && onLogout(bool);
          });
        }}
      />
      <input
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
      />
    </div>
  );
}

export default Nav;
