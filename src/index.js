import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Login"; // 👈 import the new Login page
import "./index.css";
import "./pages/Home.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<App />} />
        <Route path="/login" element={<Login />} /> {/* 👈 new Google login route */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);


//754334148383-if6k30mtllhcau2sk9rduqjsbpcnvleb.apps.googleusercontent.com