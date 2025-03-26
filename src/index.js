import React from "react";
import { createRoot } from "react-dom/client"; // ✅ Correct for React 19
import App from "./App";

const root = createRoot(document.getElementById("root")); // ✅ Use createRoot
root.render(<App />);
