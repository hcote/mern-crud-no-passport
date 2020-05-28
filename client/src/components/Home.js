import React from "react";
import Nav from "./Nav";
import Body from "./Body";
import "../styles/app.css";

function Home({ issuer, m, onLogout, didEncoded, todos, removeDeletedTodoFromView, addNewTodo }) {
  return (
    <div>
      <Nav issuer={issuer} m={m} didEncoded={didEncoded} onLogout={onLogout} />
      <Body
        todos={todos}
        removeDeletedTodoFromView={removeDeletedTodoFromView}
        addNewTodo={addNewTodo}
      />
    </div>
  );
}

export default Home;
