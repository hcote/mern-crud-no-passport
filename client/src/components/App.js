import React, { useState, useEffect } from "react";
import { Magic } from "magic-sdk";
import Signup from "./Signup";
import Home from "./Home";
import "../styles/app.css";

let m = new Magic("pk_test_F9BFAF896773C894");
m.preload();

function App() {
  const [issuer, setIssuer] = useState("");
  const [didEncoded, setDidEncoded] = useState("");
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    m.user.getMetadata().then(issuer => {
      setIssuer(issuer);
    });
  }, [didEncoded]);

  return (
    <div className="App">
      {!issuer ? (
        <Signup m={m} onLogin={did => setDidEncoded(did)} />
      ) : (
        <Home issuer={issuer} m={m} didEncoded={didEncoded} onLogout={() => setIssuer("")} />
      )}
    </div>
  );
}

export default App;

/**
 * Email is sent
 * User is authenticated with Magic sdk and an encoded did_token is returned as proof
 * fetch POST sent to backend containing encoded did_token
 *    POST contains encoded DID & user object containing issuer, publicAddress, claim;
 *    also included session.Session.cookie._expires & session.Session.passport.user = did:ethr:addr
 * setAuthenticated() is run, which runs useEffect()
 * Issuer is then set via m.user.getMetadata()
 * Home component is rendered, passing issuer props containing: issuer (did), email, publicAddress
 */

/**
 * encoded did contains:
 * [0] proof
 * [1]
 *     iat (issued at)
 *     ext
 *     iss (did:ethr:addr)
 *     sub (subject => user id)
 *     aud
 *     nbf
 *     tid
 *     add
 */
