import React from "react";
import ReactDOM from "react-dom"; // ✅ Use react-dom, not react-dom/client
import App from "./App";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root") // Make sure this div exists in index.html
);
