import React, { useState, useEffect } from "react";
import { Magic } from "magic-sdk";
import Layout from "./Layout";

/* initializing context API values */
export const MagicContext = React.createContext();
export const LoggedInContext = React.createContext();
export const LoadingContext = React.createContext();

/* this function wraps our entire app within our context APIs so all components have access to their values */
const Store = ({ children }) => {
  const [magic, setMagic] = useState();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      /* preload iframe */
      let m = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY);
      m.preload();
      await setMagic(m);

      /* On page refresh, send a request to /api/user to see if there's a valid user session */
      let res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
        method: "GET",
      credentials: "include"
      });
      let data = await res.json();

      /* If the user has a valid session with our server, it will return {authorized: true, user: user} */
      let loggedIn = data.authorized ? data.user : false;

      /* If db returns {authorized: false}, there is no valid session, so log user out of their session with Magic if it exists */
      !loggedIn && magic && magic.user.logout();

      await setLoggedIn(loggedIn.email);
      setIsLoading(false);
    })();
  }, []);

  return (
    // `children` (passed as props in this file) represents the component nested inside <Store /> in `/pages/index.js` and `/pages/login.js`
    <LoggedInContext.Provider value={[loggedIn, setLoggedIn]}>
      <MagicContext.Provider value={[magic]}>
        <LoadingContext.Provider value={[isLoading, setIsLoading]}>
          <Layout />
          {children}
        </LoadingContext.Provider>
      </MagicContext.Provider>
    </LoggedInContext.Provider>
  );
};

export default Store;
