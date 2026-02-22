import React from "react";
import ReactDOM from "react-dom/client";
import Toolbox from "./components/Toolbox";
import "./index.css";

ReactDOM.createRoot(document.getElementById("toolbox-root")!).render(
  <React.StrictMode>
    <Toolbox />
  </React.StrictMode>
);
