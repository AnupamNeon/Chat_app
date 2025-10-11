import { Server } from "socket.io";
import http from "http";
import express from "express";
import { verifyToken } from "../utils/jwt.utils.js";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

const userSocketMap = {};

io.use(async (socket, next) => {
  try {
    // Try multiple ways to get the token
    let token = socket.handshake.auth?.token;
    
    // Try from cookies
    if (!token && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = decodeURIComponent(value || '');
        return acc;
      }, {});
      token = cookies.jwt;
    }
    
    // Try from auth userId (for reconnection)
    const userId = socket.handshake.auth?.userId;
    if (!token && userId) {
      // Verify user exists
      const user = await User.findById(userId);
      if (user) {
        socket.userId = user._id.toString();
        return next();
      }
    }
    
    if (!token) {
      console.log("No token found in socket handshake");
      return next(new Error("Authentication error - No token provided"));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = user._id.toString();
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication error"));
  }
});

// Update the socket connection handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId, socket.id);

  const userId = socket.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    
    // Update user online status
    User.findByIdAndUpdate(userId, { 
      isOnline: true 
    }).catch(console.error);

    // Join user to their own room for targeted messages
    socket.join(userId);
  }

  // Send online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Typing indicators
  socket.on("typing-start", (data) => {
    const { receiverId } = data;
    socket.to(receiverId).emit("user-typing", {
      userId: socket.userId,
      isTyping: true
    });
  });

  socket.on("typing-stop", (data) => {
    const { receiverId } = data;
    socket.to(receiverId).emit("user-typing", {
      userId: socket.userId,
      isTyping: false
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId, socket.id);
    
    if (userId) {
      delete userSocketMap[userId];
      
      // Update user offline status
      User.findByIdAndUpdate(userId, { 
        isOnline: false,
        lastSeen: new Date()
      }).catch(console.error);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };