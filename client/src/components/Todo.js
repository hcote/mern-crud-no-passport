import React from "react";
import "../styles/app.css";

function Todo({ todo, removeDeletedTodoFromView }) {
  const deleteFromDatabase = id => {
    fetch(`http://localhost:8080/api/delete-todo/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      withCredentials: true,
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => console.log("Task deleted."));
  };

  return (
    <div className="todo-item-container">
      <div className="todo-item-name">{todo.todo}</div>
      <form>
        <input
          type="button"
          value="Delete"
          className="todo-item-delete-btn"
          onClick={() => {
            deleteFromDatabase(todo._id);
            removeDeletedTodoFromView(todo._id);
          }}
        />
      </form>
    </div>
  );
}

export default Todo;
