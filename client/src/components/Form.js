import React, { useState } from "react";
import Todo from "./Todo";
import "../styles/app.css";

function Form({ addNewTodo }) {
  let [todo, setTodo] = useState("");
  let [errorMsg, setErrorMsg] = useState("");

  return (
    <div className="App">
      <form>
        <input
          type="text"
          placeholder="Todo..."
          name="todo"
          value={todo}
          onChange={e => {
            setTodo(e.target.value);
          }}
        />
        <div>{errorMsg}</div>
        <input
          type="submit"
          value="Submit"
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
    </div>
  );
}

export default Form;
