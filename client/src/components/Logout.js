import React from "react";
import "../styles/app.css";

function Logout({ onLogout }) {
  const requestLogout = url => {
    return fetch(url, {
      method: "GET",
      withCredentials: true,
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => onLogout(true));
  };

  return (
    <div>
      <input
        type="submit"
        value="Logout"
        className="logout-btn"
        onClick={async e => {
          e.preventDefault();
          requestLogout(`http://localhost:8080/api/user/logout`);
        }}
      />
    </div>
  );
}

export default Logout;
