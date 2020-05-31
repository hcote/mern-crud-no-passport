import React from "react";
import Todo from "./Todo";
import "../styles/app.css";

function TodoList({ todos, removeDeletedTodoFromView, onLogout }) {
  return (
    <div className="todo-list-container">
      {todos
        ? todos.map(todo => {
            return (
              <Todo
                todo={todo}
                key={todo._id}
                removeDeletedTodoFromView={removeDeletedTodoFromView}
                onLogout={onLogout}
              />
            );
          })
        : null}
    </div>
  );
}

export default TodoList;
