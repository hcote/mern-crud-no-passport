import React, { useContext, useState } from "react";
import { MagicContext, LoggedInContext, LoadingContext } from "./Store";
import { Link } from "react-router-dom";
import loadingGif from "../images/loading.gif";
import { Redirect } from "react-router-dom";
import "../styles/login.css";

const Login = props => {
  const [loggedIn, setLoggedIn] = useContext(LoggedInContext);
  const [isLoading, setIsLoading] = useContext(LoadingContext);
  const [email, setEmail] = useState("huntercote2@gmail.com");
  const [magic] = useContext(MagicContext);
  const [errorMsg, setErrorMsg] = useState("");
  const [disableLogin, setDisableLogin] = useState(false);

  const authenticateWithDb = async (DIDT) => {

    /* Pass the Decentralized ID token in the Authorization header to the database */
    let res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/login`, {
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + DIDT,
      }),
      credentials: "include"
    });

    let data = await res.json();

    /* If the user is authorized, return an object containing the user properties (issuer, publicAddress, email) */
    /* Else, the login was not successful and return false */
    return data.authorized ? data.user : false;
  };

  const handleLogin = async () => {
    try {
      /* disable the login button to prevent users from clicking it multiple times, triggering mutliple emails */
      setDisableLogin(true);

      /* Get DID Token returned from when the email link is clicked */
      const DIDT = await magic.auth.loginWithMagicLink({ email });

      /* `user` will be the user object returned from the db, or `false` if the login failed */
      let user = await authenticateWithDb(DIDT);

      if (user) {
        setLoggedIn(user.email);
        return props.history.push("/");
      }
    } catch (err) {
      /* If the user clicked "cancel", allow them to click the login again */
      setDisableLogin(false);

      /* Handle error (which can occur if the user clicks `Cancel` on the modal after submitting their email) */
      console.log(`Error logging in with Magic, ${err}`);
    }
  };

  return (
    <>
      {isLoading ? ( // if fetching data, show a loading symbol
        <img
          className="loading-gif"
          src={loadingGif}
          alt="loading..."
          height="35px"
          alt="Loading..."
        />
      ) : loggedIn ? ( // If the user is logged in, show a link to the home page
        <>
          You're already logged in! Click <Link to="/">here</Link> to view your Todos.
        </>
      ) : (
        <div className="login-form">
          <h4 className="login-form-header">Enter Your Email</h4>
          <form>
            <input
              className="login-form-input"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => {
                setErrorMsg(""); // remove error msg
                setEmail(e.target.value);
              }}
            />
            <div className="error-msg">{errorMsg}</div>
            <input
              className="login-form-submit-btn"
              type="submit"
              value="Log in"
              disabled={disableLogin}
              onClick={(e) => {
                e.preventDefault();
                if (!email) return setErrorMsg("Email cannot be empty.");
                handleLogin();
              }}
            />
          </form>
        </div>
      )}
    </>
  );
};

export default Login;