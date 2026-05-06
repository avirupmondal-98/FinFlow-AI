import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "./context/AppContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import "./App.css";

// Stable refs — created once at module load to avoid re-renders from new
// object identities on every render.
const TOASTER_TOAST_OPTIONS = {
  style: { fontFamily: "Satoshi, system-ui, sans-serif" },
};

function Shell() {
  const [resetKey, setResetKey] = useState(0);
  return (
    <div className="min-h-screen flex flex-col">
      <Header onReset={() => setResetKey((k) => k + 1)} />
      <main key={resetKey} className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Shell />
        <Toaster richColors position="top-right" toastOptions={TOASTER_TOAST_OPTIONS} />
      </BrowserRouter>
    </AppProvider>
  );
}
