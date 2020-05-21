import React from "react";
import Nav from "./Nav";

function Home({ issuer, m, onLogout }) {
  return (
    <div className="App">
      <Nav issuer={issuer} m={m} onLogout={onLogout} />
    </div>
  );
}

export default Home;
