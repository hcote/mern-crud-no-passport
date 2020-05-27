import React from "react";
import Nav from "./Nav";
import "../styles/app.css";

function Home({ issuer, m, onLogout, didEncoded }) {
  return (
    <div className="App">
      <Nav issuer={issuer} m={m} didEncoded={didEncoded} onLogout={onLogout} />
    </div>
  );
}

export default Home;
