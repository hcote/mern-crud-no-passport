import React from "react";
import "../styles/app.css";

function Logout({ onLogout }) {
  return (
    <div>
      <input
        type="submit"
        value="Logout"
        className="logout-btn"
        onClick={e => {
          e.preventDefault();
          onLogout();
        }}
      />
    </div>
  );
}

export default Logout;
