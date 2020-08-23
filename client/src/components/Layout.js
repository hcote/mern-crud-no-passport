import React, { useContext } from "react";
import { LoggedInContext, MagicContext } from "./Store";
import { Link } from "react-router-dom";
import logo from "../images/magic-horizontal-color-white.png";
import "../styles/layout.css";

const Layout = () => {
  const [loggedIn, setLoggedIn] = useContext(LoggedInContext);
  const [magic] = useContext(MagicContext);

  /**
   * Log user out of of the session with our app (clears the `auth` cookie)
   * Log the user out of their session with Magic
   */
  const handleLogout = async () => {
    await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/logout`, {
      method: "GET",
      credentials: "include"
    });
    setLoggedIn(false);
    await magic.user.logout();
  };

  return (
    <>
      <nav className="nav">
        <div>
          <img src={logo} className="nav-logo" alt="Logo" />
        </div>
        {/* If a user is logged in, show our Welcome message and Logout button */}
        {loggedIn ? (
          <>
            <div className="nav-user">Welcome, {loggedIn}</div>
            <div className="logout-btn">
              <a
                onClick={e => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Logout
              </a>
            </div>
          </>
        ) : (
          // Else, show the Login button
          <>
              <div className="login-btn">
                <Link to="login">Log in</Link>
              </div>
          </>
        )}
      </nav>
    </>
  );
};

export default Layout;
