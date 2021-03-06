import React from "react";
import { Switch, Route } from "react-router-dom";
import TodoList from "./todos/TodoList";
import Login from "./Login";

function App() {
    return (
      <>
          <Switch>
            <Route path="/" exact component={ TodoList } />
            <Route path="/login" component={ Login } />
          </Switch>
      </>
    )
}

export default App;
