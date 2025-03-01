import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SecondaryDisplay from "./SecondaryDisplay";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/secondary" element={<SecondaryDisplay />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
