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
    m.user.getMetadata().then(issuer => {
      console.log(issuer);
      setIssuer(issuer);
    });
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

/**
 * Email is sent
 * User is authenticated with Magic sdk and a did_token is returned as proof
 * fetch POST sent to backend containing did_token
 *    POST contains encoded DID & user object containing issuer, publicAddress, claim;
 *    also included session.Session.cookie._expires & session.Session.passport.user = issuer (did:ethr:addr)
 * setAuthenticated() is run, which runs useEffect()
 * Issuer is then set via m.user.getMetadata()
 * Home component is rendered, passing issuer props containing: issuer (did), email, publicAddress
 */
