import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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
      // console.log("❌ No auth user, skipping socket connection");
      return;
    }

    // Disconnect existing socket if any
    if (socket?.connected) {
      // console.log("🔌 Disconnecting existing socket");
      socket.disconnect();
      socket.removeAllListeners();
    }

    // console.log("🔄 Attempting to connect socket to:", SOCKET_URL);

    // Create new socket connection
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        userId: authUser._id  // Send userId in auth for fallback
      }
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      // console.log("✅ Socket connected successfully", newSocket.id);
      set({ isConnected: true });
      
      // Request fresh online users list after connection
      newSocket.emit("request-online-users");
    });

    newSocket.on("disconnect", (reason) => {
      // console.log("❌ Socket disconnected:", reason);
      set({ isConnected: false });
      
      // Handle different disconnect reasons
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect manually
        setTimeout(() => {
          if (get().authUser) {
            newSocket.connect();
          }
        }, 1000);
      } else if (reason === "transport close" || reason === "transport error") {
        // Network issues, socket.io will auto-reconnect
        console.log("Network issue, will auto-reconnect...");
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      set({ isConnected: false });
      
      // Only logout if explicitly authentication failed
      if (error.message?.includes("Authentication error")) {
        // console.error("Authentication failed, logging out...");
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          get().logout();
        }, 1000);
      }
    });

    // Listen for online users updates
    newSocket.on("getOnlineUsers", (userIds) => {
      // console.log("👥 Online users updated:", userIds.length, "users");
      set({ onlineUsers: Array.isArray(userIds) ? userIds : [] });
    });

    // Listen for user status changes
    newSocket.on("userStatusChanged", ({ userId, isOnline, lastSeen }) => {
      // console.log(`👤 User ${userId} is now:`, isOnline ? "online" : "offline");
      
      set(state => {
        const currentOnlineUsers = [...state.onlineUsers];
        
        if (isOnline) {
          // Add user if not already in list
          if (!currentOnlineUsers.includes(userId)) {
            return { onlineUsers: [...currentOnlineUsers, userId] };
          }
        } else {
          // Remove user from online list
          return { onlineUsers: currentOnlineUsers.filter(id => id !== userId) };
        }
        
        return state;
      });
    });

    // Reconnection event handlers
    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
      set({ isConnected: true });
      toast.success("Connection restored");
      
      // Request fresh data after reconnection
      newSocket.emit("request-online-users");
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
      if (attemptNumber === 1) {
        toast.loading("Reconnecting...", { id: "reconnecting" });
      }
    });


    newSocket.on("reconnect_failed", () => {
      // console.error("❌ Socket reconnection failed completely");
      toast.dismiss("reconnecting");
      toast.error("Connection failed. Please refresh the page.");
      set({ isConnected: false });
    });

    // Custom events for better error handling
    newSocket.on("error", (error) => {
      // console.error("Socket error:", error);
      toast.error(error.message || "Connection error occurred");
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      // console.log("🔌 Disconnecting socket...");
      socket.disconnect();
      socket.removeAllListeners();
      set({ socket: null, isConnected: false, onlineUsers: [] });
    }
  },
}));