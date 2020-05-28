import React, { useEffect, useState } from "react";
import Todo from "./Todo";
import "../styles/app.css";

function TodoList({ todos, removeDeletedTodoFromView }) {
  return (
    <div className="App">
      {todos
        ? todos.map(todo => {
            return (
              <Todo
                todo={todo}
                key={todo._id}
                removeDeletedTodoFromView={removeDeletedTodoFromView}
              />
            );
          })
        : null}
    </div>
  );
}

export default TodoList;
