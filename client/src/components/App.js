import React, { useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import TodoList from "./todos/TodoList";
import Login from "./Login";
import { ErrorPage } from "./Error";

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
