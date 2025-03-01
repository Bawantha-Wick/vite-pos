import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./styles/pos.css";
import SecondaryDisplay from "./SecondaryDisplay";
import BarcodeScanner from "./components/BarcodeScanner";
import ScaleScanner from "./components/ScaleScanner";
import CashDrawer from "./components/CashDrawer";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/secondary" element={<SecondaryDisplay />} />
        <Route path="/barcode-scanner" element={<BarcodeScanner />} />
        <Route path="/scale-scanner" element={<ScaleScanner />} />
        <Route path="/cash-drawer" element={<CashDrawer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
