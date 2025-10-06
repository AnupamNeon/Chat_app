import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "light",
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
    
    // Update the class on the document element for global theme
    document.documentElement.className = theme;
  },
}));