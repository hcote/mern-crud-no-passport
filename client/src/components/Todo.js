import React from "react";
import "../styles/app.css";

function Todo({ todo, removeDeletedTodoFromView, onLogout }) {
  const deleteFromDatabase = id => {
    fetch(`http://localhost:8080/api/todos/delete-todo/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      withCredentials: true,
      credentials: "include"
    })
      .then(res => (res.status === 200 ? res.json() : "Unauthorized"))
      .then(data => {
        if (data === "Unauthorized") onLogout(true);
      });
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
