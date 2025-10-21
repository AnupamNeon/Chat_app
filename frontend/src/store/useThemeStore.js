import { create } from "zustand";

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("chat-theme") || "light",
  
  setTheme: (theme) => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove("light", "dark");
    
    // Add the selected theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem("chat-theme", theme);
    
    // Update store
    set({ theme });
  },
  
  // Initialize theme on app load
  initTheme: () => {
    const savedTheme = localStorage.getItem("chat-theme") || "light";
    const root = document.documentElement;
    
    root.classList.remove("light", "dark");
    root.classList.add(savedTheme);
    
    set({ theme: savedTheme });
  },
  
  // Toggle between light and dark
  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === "light" ? "dark" : "light";
    get().setTheme(newTheme);
  },
}));