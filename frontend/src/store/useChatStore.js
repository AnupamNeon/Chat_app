// FILE: g:\Chat-App\frontend\src\store\useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  typingUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users/sidebar");
      
      if (Array.isArray(res.data)) {
        set({ users: res.data });
      } else {
        console.warn("Unexpected response for users:", res.data);
        set({ users: [] });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  setUsers: (users) => {
    set({ users: Array.isArray(users) ? users : [] });
  },

  getMessages: async (userId) => {
    if (!userId) {
      console.error("No user ID provided for getMessages");
      return;
    }

    set({ isMessagesLoading: true, messages: [] });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      
      const messages = Array.isArray(res.data.messages) ? res.data.messages : [];
      set({ messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      const errorMessage = error.response?.data?.message || "Failed to load messages";
      toast.error(errorMessage);
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    
    if (!selectedUser) {
      toast.error("No user selected");
      throw new Error("No user selected");
    }

    const { authUser } = useAuthStore.getState();

    // Create optimistic message with temporary ID
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text || '',
      image: messageData.image || null,
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    // Add optimistic message immediately
    set({ messages: [...messages, optimisticMessage], isSendingMessage: true });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      
      // ✅ Replace optimistic message with real message from server
      set(state => ({
        messages: state.messages.map(msg =>
          msg._id === tempId ? res.data : msg
        ),
        isSendingMessage: false,
      }));
      
      return res.data;
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Remove optimistic message on error
      set(state => ({
        messages: state.messages.filter(msg => msg._id !== tempId),
        isSendingMessage: false,
      }));
      
      let errorMessage = "Failed to send message";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 413) {
        errorMessage = "Image too large. Please select a smaller image.";
      }
      
      toast.error(errorMessage);
      throw error;
    }
  },

  // Typing indicator functions
  startTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    
    if (socket && selectedUser) {
      socket.emit('typing-start', { receiverId: selectedUser._id });
    }
  },

  stopTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    
    if (socket && selectedUser) {
      socket.emit('typing-stop', { receiverId: selectedUser._id });
    }
  },

  // Mark message as read
  markMessageAsRead: async (messageId) => {
    try {
      await axiosInstance.patch(`/messages/${messageId}/read`);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) {
      console.log("No selected user for message subscription");
      return () => {};
    }

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("No socket available for subscription");
      return () => {};
    }

    console.log("📨 Subscribing to messages for user:", selectedUser._id);

    // Helper function to normalize IDs (handle both populated and string IDs)
    const normalizeId = (id) => {
      if (!id) return null;
      return typeof id === 'object' ? id._id : id;
    };

    // Handler for new messages
    const handleNewMessage = (newMessage) => {
      const { selectedUser: currentSelectedUser, messages } = get();
      const { authUser } = useAuthStore.getState();
      
      if (!currentSelectedUser || !authUser) return;

      console.log("📩 New message received via socket:", newMessage._id);

      const senderId = normalizeId(newMessage.senderId);
      const receiverId = normalizeId(newMessage.receiverId);
      const currentUserId = currentSelectedUser._id;
      const myId = authUser._id;

      // Check if message belongs to current conversation
      const isMessageForCurrentConversation = 
        (senderId === currentUserId && receiverId === myId) ||
        (senderId === myId && receiverId === currentUserId);

      if (isMessageForCurrentConversation) {
        // ✅ FIXED: Check for duplicates including temp IDs
        const messageExists = messages.some(msg => {
          // Check if real message with same ID already exists
          if (msg._id === newMessage._id) return true;
          
          // Check if this is replacing an optimistic message
          // Optimistic messages have temp IDs and status 'sending'
          if (msg.status === 'sending' && msg._id.startsWith('temp-')) {
            // Check if content matches (same text/image, close timestamp)
            const isSameMessage = 
              msg.text === newMessage.text &&
              msg.image === newMessage.image &&
              Math.abs(new Date(msg.createdAt) - new Date(newMessage.createdAt)) < 5000;
            
            if (isSameMessage) {
              console.log("⚠️ This is the server response for optimistic message, already replaced");
              return true;
            }
          }
          
          return false;
        });

        if (!messageExists) {
          console.log("✅ Adding new message from socket to conversation");
          set(state => ({
            messages: [...state.messages, newMessage]
          }));

          // If message is from other user, mark as read
          if (senderId === currentUserId && newMessage._id) {
            setTimeout(() => {
              get().markMessageAsRead(newMessage._id);
            }, 1000);
          }
        } else {
          console.log("⚠️ Message already exists, skipping");
        }
      }
    };

    // Handler for typing indicators
    const handleUserTyping = ({ userId, isTyping }) => {
      const { selectedUser: currentSelectedUser } = get();
      
      if (currentSelectedUser && userId === currentSelectedUser._id) {
        set(state => ({
          typingUsers: isTyping
            ? [...new Set([...state.typingUsers, userId])]
            : state.typingUsers.filter(id => id !== userId)
        }));
      }
    };

    // Handler for message read status
    const handleMessageRead = ({ messageId, readAt }) => {
      console.log("✓✓ Message marked as read:", messageId);
      set(state => ({
        messages: state.messages.map(msg =>
          msg._id === messageId
            ? { ...msg, status: 'read', readAt }
            : msg
        )
      }));
    };

    // Attach event listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("messageRead", handleMessageRead);

    // Return cleanup function
    return () => {
      console.log("🔌 Unsubscribing from messages");
      socket.off("newMessage", handleNewMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("messageRead", handleMessageRead);
    };
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("user-typing");
      socket.off("messageRead");
    }
    // Clear typing users
    set({ typingUsers: [] });
  },

  setSelectedUser: (selectedUser) => {
    console.log("👤 Setting selected user:", selectedUser?.fullName || "None");
    
    // Stop typing for previous user
    get().stopTyping();
    
    set({ 
      selectedUser, 
      messages: [],
      typingUsers: [],
      isMessagesLoading: false 
    });
  },

  clearStore: () => {
    set({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      isSendingMessage: false,
      typingUsers: [],
    });
  },
}));