import React, { useState } from "react";
import { serverUrl } from "../config/settings";
import "../styles/app.css";

function Form({ m, addNewTodo, onLogout }) {
  let [todo, setTodo] = useState("");
  let [errorMsg, setErrorMsg] = useState("");

  const postTodoToServer = url => {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ todo })
    }).then(res => (res.status === 200 ? res.json() : "Unauthorized"));
  };

  return (
    <div className="add-todo-form-container">
      <form className="add-todo-form">
        <input
          type="text"
          placeholder=" Todo..."
          name="todo"
          autoComplete="off"
          className="add-todo-input"
          value={todo}
          onChange={e => {
            if (todo.length) setErrorMsg("");
            setTodo(e.target.value);
          }}
        />

        <input
          type="submit"
          value="Add"
          className="add-todo-submit-btn"
          onClick={e => {
            e.preventDefault();
            if (!todo.length) {
              setErrorMsg("Field must not be empty.");
            } else {
              postTodoToServer(`${serverUrl}/todos/add-todo`).then(data => {
                if (data === "Unauthorized") {
                  onLogout(true);
                } else {
                  addNewTodo(data.todo);
                  setTodo("");
                }
              });
            }
          }}
        />
      </form>
      <div className="add-todo-error-msg">{errorMsg}</div>
    </div>
  );
}

export default Form;
