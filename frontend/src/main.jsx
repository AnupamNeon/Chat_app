import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

// Initialize theme before React renders
const initTheme = () => {
  const savedTheme = localStorage.getItem("chat-theme") || "light";
  const root = document.documentElement;
  
  // Add preload class to prevent transitions on page load
  root.classList.add('preload');
  
  root.classList.remove("light", "dark");
  root.classList.add(savedTheme);
  
  // Remove preload class after a brief delay
  setTimeout(() => {
    root.classList.remove('preload');
  }, 100);
};

initTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);