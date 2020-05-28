import React from "react";
import Form from "./Form";
import TodoList from "./TodoList";
import "../styles/app.css";

function Body({ todos, removeDeletedTodoFromView, addNewTodo }) {
  return (
    <div className="body-container">
      <Form addNewTodo={addNewTodo} />
      <TodoList todos={todos} removeDeletedTodoFromView={removeDeletedTodoFromView} />
    </div>
  );
}

export default Body;
