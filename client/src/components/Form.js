import React, { useState } from "react";
import { serverUrl } from "../config/settings";
import "../styles/app.css";

function Form({ addNewTodo, onLogout }) {
  let [todo, setTodo] = useState("");
  let [errorMsg, setErrorMsg] = useState("");

  /**
   *  Send POST request to server with the Todo in the body
   */
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
            if (e.target.value) setErrorMsg("");
            setTodo(e.target.value);
          }}
        />

        <input
          type="submit"
          value="Add"
          className="add-todo-submit-btn"
          /**
           * If the form is empty, flash error message
           * Otherwise, post data to server
           * If server responds with a 401 status code, current session is expired and log user out of Magic
           * If server responds with a 200 status code, add new Todo to our view and clear the form input
           */
          onClick={async e => {
            e.preventDefault();
            if (!todo.length) {
              return setErrorMsg("Field must not be empty.");
            }
            let data = await postTodoToServer(`${serverUrl}/todos/add-todo`);
            if (data === "Unauthorized") {
              onLogout();
            } else {
              addNewTodo(data.todo);
              setTodo("");
            }
          }}
        />
      </form>
      <div className="add-todo-error-msg">{errorMsg}</div>
    </div>
  );
}

export default Form;
