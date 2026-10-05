import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import SignUp from "../Pages/SignUp/SignUp";
import Login from "../Pages/Login/Login";
import Home from "../Pages/Home/Home";


const Router = () => {
  return (
    <BrowserRouter>

      <Routes>

        
        <Route
          path="/signup"
          element={<SignUp />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        
        <Route
          path="/home"
          element={<Home />}
        />

      </Routes>

    </BrowserRouter>
  );
};

export default Router;