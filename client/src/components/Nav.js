import React from "react";

function Nav({ issuer, m, onLogout }) {
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
    </div>
  );
}

export default Nav;
