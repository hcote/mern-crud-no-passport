import React, { useState, useEffect } from "react";
import { Magic } from "magic-sdk";
import Signup from "./Signup";
import Home from "./Home";
import Nav from "./Nav";
import loading from "../load.gif";
import { MAGIC_PUBLISHABLE_KEY, serverUrl } from "../config/settings";
import "../styles/app.css";

let m = new Magic(MAGIC_PUBLISHABLE_KEY);
m.preload(); // load iFrame

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [todos, setTodos] = useState([]);

  /**
   * Makes GET request to server at the endpoint passed in as the argument
   * Returns "Unauthorized" if the response is not 200
   */
  const fetchDataFromDb = async url => {
    let res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      withCredentials: true,
      credentials: "include"
    });
    return res.status === 200 ? res.json() : "Unauthorized";
  };

  /**
   * Filters out the Todo that was deleted from the page
   * Returns new todo array which is then rendered to the page
   */
  const removeDeletedTodoFromView = id => {
    let newTodos = todos.filter(todo => id !== todo._id);
    setTodos(newTodos);
  };

  /**
   * Removes request session object (used by server for authorization)
   * clears isLoggedIn so that <Signup /> is rendered instead of <Home />
   * Logs user out of Magic session
   */
  const logout = async () => {
    await fetch(`${serverUrl}/user/logout`, {
      method: "GET",
      withCredentials: true,
      credentials: "include"
    });
    setIsLoggedIn(false);
    m.user.logout();
    setIsLoading(false);
  };

  /**
   * Runs on page laod
   * Makes a request to the server to see if the session has expired
   * Session is expired? Logout of Magic
   * Otherwise, set isLoggedIn to the current user's email
   */
  useEffect(() => {
    async function isSessionAlive() {
      setIsLoading(true);
      let data = await fetchDataFromDb(`${serverUrl}/user`);
      data === "Unauthorized" ? logout() : setIsLoggedIn(data.email);
    }
    isSessionAlive();
  }, []);

  /**
   * This function runs when a user is logged in
   * When the email state variable is updated (i.e. a user logs in or logs out), this fn runs
   * Makes GET request to server for all Todos
   * Takes response and sets the Todos variable, rendering them to the view
   */
  useEffect(() => {
    async function runWhenUserLogsIn() {
      setIsLoading(true);
      let data = isLoggedIn ? await fetchDataFromDb(`${serverUrl}/todos/all-todos`) : null;
      if (!data) {
        return setIsLoading(false);
      }
      data === "Unauthorized" ? logout() : setTodos(data.todos);
      setIsLoading(false);
    }
    runWhenUserLogsIn();
  }, [isLoggedIn]);

  /**
   * If page is loading, render leading GIF. Otherwise...
   * Check if isLoggedIn is true. If so, render <Signup /> otherwise render <Home />
   */
  return (
    <div className="App">
      <Nav isLoggedIn={isLoggedIn} onLogout={() => logout()} />
      {isLoading ? (
        <img className="loading-gif" src={loading} alt="loading..." height="30px" />
      ) : !isLoggedIn ? (
        <Signup
          m={m}
          onLogin={isLoggedIn => setIsLoggedIn(isLoggedIn)}
          setTodos={todos => setTodos(todos)}
        />
      ) : (
        <Home
          m={m}
          todos={todos}
          addNewTodo={newTodo => setTodos([...todos, newTodo])}
          removeDeletedTodoFromView={id => removeDeletedTodoFromView(id)}
          onLogout={() => logout()}
        />
      )}
    </div>
  );
}

export default App;
