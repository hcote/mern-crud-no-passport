import React, { useState, useEffect } from "react";
import { Magic } from "magic-sdk";
import Signup from "./Signup";
import Home from "./Home";
import "../styles/app.css";

let m = new Magic("pk_test_F9BFAF896773C894");
m.preload().then(() => console.log("Magic <iframe> loaded."));

function App() {
  const [issuer, setIssuer] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    m.user.getMetadata().then(issuer => setIssuer(issuer));
  }, [isAuthenticated]);

  return (
    <div className="App">
      {!issuer ? (
        <Signup m={m} onLogin={did => setIsAuthenticated(did)} />
      ) : (
        <Home issuer={issuer} m={m} onLogout={() => setIssuer("")} />
      )}
    </div>
  );
}

export default App;
