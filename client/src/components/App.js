import React, { useState, useEffect } from "react";
import { Magic } from "magic-sdk";
import Signup from "./Signup";
import Home from "./Home";
import Nav from "./Nav";
import loading from "../load.gif";
import { MAGIC_PUBLISHABLE_KEY, serverUrl } from "../config/settings";
import "../styles/app.css";

let m = new Magic(MAGIC_PUBLISHABLE_KEY);
m.preload();

function App() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [todos, setTodos] = useState([]);

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

  const removeDeletedTodoFromView = id => {
    let newTodos = todos.filter(todo => id !== todo._id);
    setTodos(newTodos);
  };

  useEffect(() => {
    async function runOnPageRefresh() {
      setIsLoading(true);
      let data = await fetchDataFromDb(`${serverUrl}/user`);
      if (data === "Unauthorized") {
        setEmail("");
        m.user.logout();
      } else {
        setEmail(data.email);
      }
      setIsLoading(false);
    }
    runOnPageRefresh();
  }, []);

  useEffect(() => {
    async function runWhenUserLogsIn() {
      setIsLoading(true);
      let data = email ? await fetchDataFromDb(`${serverUrl}/todos/all-todos`) : null;
      if (!data) {
        return setIsLoading(false);
      } else if (data === "Unauthorized") {
        m.user.logout();
        setEmail("");
      } else {
        setTodos(data.todos);
      }
      setIsLoading(false);
    }
    runWhenUserLogsIn();
  }, [email]);

  return (
    <div className="App">
      <Nav email={email} onLogout={() => setEmail("")} />
      {isLoading ? (
        <img className="loading-gif" src={loading} alt="loading..." height="30px" />
      ) : !email ? (
        <Signup m={m} onLogin={email => setEmail(email)} setTodos={todos => setTodos(todos)} />
      ) : (
        <Home
          m={m}
          email={email}
          todos={todos}
          addNewTodo={newTodo => setTodos([...todos, newTodo])}
          removeDeletedTodoFromView={id => removeDeletedTodoFromView(id)}
          onLogout={() => {
            setEmail("");
            m.user.logout();
            setIsLoading(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
