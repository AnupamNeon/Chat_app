// FILE: g:\Chat-App\frontend\src\store\useAuthStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_API_BASE_URL
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : SERVER_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isConnected: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null, onlineUsers: [], isConnected: false });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    
    if (!authUser) {
      console.log("❌ No auth user, skipping socket connection");
      return;
    }

    // Disconnect existing socket if any
    if (socket?.connected) {
      console.log("🔌 Disconnecting existing socket");
      socket.disconnect();
      socket.removeAllListeners();
    }

    console.log("🔄 Attempting to connect socket...");

    // ✅ FIXED: Don't try to manually extract httpOnly cookie
    // Just use withCredentials to automatically send cookies
    const newSocket = io(BASE_URL, {
      withCredentials: true, // This sends httpOnly cookies automatically
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Socket connected successfully", newSocket.id);
      set({ isConnected: true });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      set({ isConnected: false, onlineUsers: [] });
      
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect manually
        newSocket.connect();
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      set({ isConnected: false });
      
      // If authentication fails, logout user
      if (error.message.includes("Authentication") || error.message.includes("authenticated")) {
        console.error("Authentication failed, logging out...");
        setTimeout(() => {
          get().logout();
        }, 1000);
      }
    });

    // Listen for online users
    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("👥 Online users updated:", userIds.length, "users");
      set({ onlineUsers: Array.isArray(userIds) ? userIds : [] });
    });

    // Listen for user status changes
    newSocket.on("userStatusChanged", ({ userId, isOnline, lastSeen }) => {
      console.log(`👤 User ${userId} is now:`, isOnline ? "online" : "offline");
    });

    // Reconnection event handlers
    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
      set({ isConnected: true });
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error.message);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("❌ Socket reconnection failed completely");
      toast.error("Unable to connect. Please refresh the page.");
      set({ isConnected: false });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      console.log("🔌 Disconnecting socket...");
      socket.disconnect();
      socket.removeAllListeners();
      set({ socket: null, isConnected: false, onlineUsers: [] });
    }
  },
}));