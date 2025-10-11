import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const isDevelopment = import.meta.env.NODE_ENV === 'development';
export const useChatStore = create((set, get) => ({

  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  typingUsers: [],
  unreadCounts: {},

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users/sidebar");
      
      if (Array.isArray(res.data)) {
        set({ users: res.data });
      } else {
        if (isDevelopment){
          console.warn("Unexpected response for users:", res.data);
        set({ users: [] })};
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
      if (isDevelopment)
        console.error("No user ID provided for getMessages");
      return;
    }

    set({ isMessagesLoading: true, messages: [] });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      
      const messages = Array.isArray(res.data.messages) ? res.data.messages : [];
      set({ messages });
      
      // Mark messages as read if there are any unread ones
      if (messages.length > 0) {
        const unreadMessages = messages.filter(msg => 
          msg.receiverId === useAuthStore.getState().authUser._id && 
          msg.status !== 'read'
        );
        
        if (unreadMessages.length > 0) {
          // Mark all as read
          await axiosInstance.patch(`/messages/${userId}/read-all`);
        }
      }
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

    // Add optimistic message immediately for better UX
    set({ 
      messages: [...messages, optimisticMessage], 
      isSendingMessage: true 
    });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      
      // Replace optimistic message with real message from server
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
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your connection.";
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
      
      // Update local message status
      set(state => ({
        messages: state.messages.map(msg =>
          msg._id === messageId
            ? { ...msg, status: 'read', readAt: new Date() }
            : msg
        )
      }));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) {
      if (isDevelopment) console.log("No selected user for message subscription");
      return () => {};
    }

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      if (isDevelopment) console.warn("No socket available for subscription");
      return () => {};
    }

    if (isDevelopment) console.log("📨 Subscribing to messages for user:", selectedUser._id);

    // Helper function to normalize IDs
    const normalizeId = (id) => {
      if (!id) return null;
      return typeof id === 'object' ? id._id : id;
    };

    // Handler for new messages
    const handleNewMessage = (newMessage) => {
      const { selectedUser: currentSelectedUser } = get();
      const { authUser } = useAuthStore.getState();
      
      if (!currentSelectedUser || !authUser) return;

      if (isDevelopment) console.log("📩 New message received via socket:", newMessage);

      const senderId = normalizeId(newMessage.senderId);
      const receiverId = normalizeId(newMessage.receiverId);
      const currentUserId = currentSelectedUser._id;
      const myId = authUser._id;

      // Check if message belongs to current conversation
      const isMessageForCurrentConversation = 
        (senderId === currentUserId && receiverId === myId) ||
        (senderId === myId && receiverId === currentUserId);

      if (isMessageForCurrentConversation) {
        set(state => {
          // Check if message already exists
          const messageExists = state.messages.some(msg => {
            // Check by ID
            if (msg._id === newMessage._id) {
              if (isDevelopment) console.log("⚠️ Message already exists by ID");
              return true;
            }
            
            // Check if this is replacing a temp message
            if (msg._id?.startsWith('temp-') && msg.status === 'sending') {
              // Check if it's the same message
              const isSameMessage = 
                msg.text === newMessage.text &&
                msg.image === newMessage.image &&
                normalizeId(msg.senderId) === senderId &&
                normalizeId(msg.receiverId) === receiverId;
              
              if (isSameMessage) {
                if (isDevelopment) console.log("✅ Found matching temp message to replace");
                return false; // Will be replaced
              }
            }
            
            return false;
          });

          if (messageExists) {
            return state; // Don't add duplicate
          }

          // Check if we need to replace a temp message
          let updatedMessages = [...state.messages];
          let wasReplaced = false;

          updatedMessages = updatedMessages.map(msg => {
            if (msg._id?.startsWith('temp-') && 
                msg.status === 'sending' &&
                msg.text === newMessage.text &&
                msg.image === newMessage.image &&
                normalizeId(msg.senderId) === senderId &&
                normalizeId(msg.receiverId) === receiverId) {
              if (isDevelopment) console.log("✅ Replacing temp message with real message");
              wasReplaced = true;
              return newMessage;
            }
            return msg;
          });

          // If not replaced, add as new message
          if (!wasReplaced) {
            if (isDevelopment) console.log("✅ Adding new message to conversation");
            updatedMessages.push(newMessage);
          }

          return { messages: updatedMessages };
        });

        // Mark as read if from other user
        if (senderId === currentUserId && newMessage._id && !newMessage._id.startsWith('temp-')) {
          setTimeout(() => {
            get().markMessageAsRead(newMessage._id);
          }, 1000);
        }
      } else {
        // Message for different conversation - update unread count
       if (isDevelopment) console.log("📬 Message for different conversation, updating unread count");
        set(state => ({
          unreadCounts: {
            ...state.unreadCounts,
            [senderId]: (state.unreadCounts[senderId] || 0) + 1
          }
        }));
        
        // Show notification
        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          const senderUser = get().users.find(u => u._id === senderId);
          new Notification(`New message from ${senderUser?.fullName || 'Someone'}`, {
            body: newMessage.text || 'Sent an image',
            icon: senderUser?.profilePic || '/avatar.png'
          });
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
        
        // Clear typing indicator after timeout
        if (isTyping) {
          setTimeout(() => {
            set(state => ({
              typingUsers: state.typingUsers.filter(id => id !== userId)
            }));
          }, 3000);
        }
      }
    };

    // Handler for message read status updates
    const handleMessageRead = ({ messageId, readAt }) => {
      if (isDevelopment) console.log("✓✓ Message marked as read:", messageId);
      set(state => ({
        messages: state.messages.map(msg =>
          msg._id === messageId
            ? { ...msg, status: 'read', readAt }
            : msg
        )
      }));
    };

    // Handler for all messages read
    const handleAllMessagesRead = ({ userId, conversationId }) => {
      if (isDevelopment) console.log("✓✓ All messages marked as read by:", userId);
      const { authUser } = useAuthStore.getState();
      
      if (authUser._id === userId) return; // Skip if it's our own action
      
      set(state => ({
        messages: state.messages.map(msg => {
          if (msg.senderId === authUser._id && msg.status !== 'read') {
            return { ...msg, status: 'read', readAt: new Date() };
          }
          return msg;
        })
      }));
    };

    // Attach event listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("messageRead", handleMessageRead);
    socket.on("allMessagesRead", handleAllMessagesRead);

    // Return cleanup function
    return () => {
      if (isDevelopment) console.log("🔌 Unsubscribing from messages");
      socket.off("newMessage", handleNewMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("messageRead", handleMessageRead);
      socket.off("allMessagesRead", handleAllMessagesRead);
    };
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("user-typing");
      socket.off("messageRead");
      socket.off("allMessagesRead");
    }
    // Clear typing users
    set({ typingUsers: [] });
  },

  setSelectedUser: (selectedUser) => {
    if (isDevelopment) console.log("👤 Setting selected user:", selectedUser?.fullName || "None");
    
    // Stop typing for previous user
    get().stopTyping();

    // Clear unread count for this user
    if (selectedUser) {
      set(state => ({
        unreadCounts: {
          ...state.unreadCounts,
          [selectedUser._id]: 0
        }
      }));
    }

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
      unreadCounts: {},
    });
  },
}));

// Request notification permission on store initialization
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}