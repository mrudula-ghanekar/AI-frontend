import React from "react";
import { createRoot } from "react-dom/client"; // ✅ Correct for React 19
import { BrowserRouter } from "react-router-dom"; // ✅ Import BrowserRouter
import App from "./App";

const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
