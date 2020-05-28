import React, { useState } from "react";
import Todo from "./Todo";
import "../styles/app.css";

function Form({ addNewTodo }) {
  let [todo, setTodo] = useState("");
  let [errorMsg, setErrorMsg] = useState("");

  return (
    <div className="add-todo-form-container">
      <form className="add-todo-form">
        <input
          type="text"
          placeholder="Todo..."
          name="todo"
          autoComplete="off"
          className="add-todo-input"
          value={todo}
          onChange={e => {
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
              return setErrorMsg("Field must not be empty.");
            }
            setErrorMsg("");
            fetch("http://localhost:8080/api/todo", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify({ todo })
            })
              .then(res => res.json())
              .then(data => {
                addNewTodo(data.todo);
                setTodo("");
              });
          }}
        />
      </form>
      <div className="add-todo-error-msg">{errorMsg}</div>
    </div>
  );
}

export default Form;
