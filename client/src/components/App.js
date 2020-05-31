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

  const fetchDataFromDb = url => {
    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      withCredentials: true,
      credentials: "include"
    }).then(res => (res.status === 200 ? res.json() : "Unauthorized"));
  };

  const removeDeletedTodoFromView = id => {
    let newTodos = todos.filter(todo => id !== todo._id);
    setTodos(newTodos);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchDataFromDb(`${serverUrl}/user`).then(data => {
      if (data === "Unauthorized") {
        setEmail("");
        m.user.logout();
      } else {
        setEmail(data.email);
      }
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    if (!email) return;
    fetchDataFromDb(`${serverUrl}/todos/all-todos`).then(data => {
      if (data === "Unauthorized") {
        m.user.logout();
        setEmail("");
      } else {
        setTodos(data.todos);
      }
    });
    setIsLoading(false);
  }, [email]);

  return (
    <div className="App">
      <Nav email={email} onLogout={() => setEmail("")} />
      {!email ? (
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
          }}
        />
      )}
      {/* <img src={loading} alt="loading..." height="25px" /> */}
    </div>
  );
}

export default App;
