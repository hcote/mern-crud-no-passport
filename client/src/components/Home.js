import React from "react";
import Form from "./Form";
import TodoList from "./TodoList";
import "../styles/app.css";

function Home({ m, todos, removeDeletedTodoFromView, addNewTodo, onLogout }) {
  return (
    <div className="body-container">
      <Form m={m} addNewTodo={addNewTodo} onLogout={onLogout} />
      <TodoList
        todos={todos}
        removeDeletedTodoFromView={removeDeletedTodoFromView}
        onLogout={onLogout}
      />
    </div>
  );
}

export default Home;
