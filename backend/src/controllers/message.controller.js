import mongoose from "mongoose";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import { CloudinaryService } from "../services/cloudinary.service.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const getMessages = async (req, res, next) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Validate userToChatId
    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Create sorted participants array for consistent lookup
    const participants = [myId.toString(), userToChatId].sort();

    // ✅ FIXED: Better conversation lookup
    const conversation = await Conversation.findOne({
      participants: { $all: participants },
      $expr: { $eq: [{ $size: "$participants" }, 2] }
    })
    .populate('participants', 'fullName profilePic')
    .populate('messages.senderId', 'fullName profilePic')
    .populate('messages.receiverId', 'fullName profilePic');

    if (!conversation) {
      return res.status(200).json({
        messages: [],
        conversationId: null
      });
    }

    // Sort messages by createdAt in ascending order (oldest first)
    const sortedMessages = conversation.messages
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    res.status(200).json({
      messages: sortedMessages,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate receiverId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver ID" });
    }

    // Validate that at least one field is provided
    if ((!text || !text.trim()) && !image) {
      return res.status(400).json({ 
        message: "Either text or image is required" 
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let imageUrl = null;
    if (image) {
      try {
        const { url } = await CloudinaryService.uploadImage(image, 'chat_app/messages');
        imageUrl = url;
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return res.status(400).json({ 
          message: `Image upload failed: ${uploadError.message}` 
        });
      }
    }

    // Create message object
    const newMessage = {
      senderId,
      receiverId,
      text: text?.trim() || '',
      image: imageUrl,
      status: 'sent',
      createdAt: new Date()
    };

    // Create sorted participants array for consistent lookup
    const participants = [senderId.toString(), receiverId.toString()].sort();

    // ✅ FIXED: Better conversation lookup
    let conversation = await Conversation.findOne({
      participants: { $all: participants },
      $expr: { $eq: [{ $size: "$participants" }, 2] }
    });

    if (!conversation) {
      // console.log("Creating new conversation");
      conversation = new Conversation({
        participants: participants,
        messages: [newMessage],
        unreadCount: new Map([[receiverId.toString(), 1]]),
        lastMessage: newMessage
      });
    } else {
      // console.log("Adding message to existing conversation");
      // Add message to existing conversation
      conversation.messages.push(newMessage);
      
      // Update last message
      conversation.lastMessage = newMessage;
      
      // Increment unread count for receiver
      const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
      conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
    }

    await conversation.save();
    // console.log("Conversation saved successfully, ID:", conversation._id);

    // Populate the saved message
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('messages.senderId', 'fullName profilePic')
      .populate('messages.receiverId', 'fullName profilePic')
      .populate('participants', 'fullName profilePic');

    // Get the newly added message (last one in array)
    const savedMessage = populatedConversation.messages[populatedConversation.messages.length - 1];

    // Socket.io real-time update - send to both sender and receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", savedMessage);
    }
    
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Find conversation containing this message
    const conversation = await Conversation.findOne({
      "messages._id": messageId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Find and update the message
    const message = conversation.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() === userId.toString()) {
      return res.status(400).json({ message: "Cannot mark your own message as read" });
    }

    message.status = 'read';
    message.readAt = new Date();

    // Decrement unread count
    const currentUnread = conversation.unreadCount.get(userId.toString()) || 0;
    if (currentUnread > 0) {
      conversation.unreadCount.set(userId.toString(), currentUnread - 1);
    }

    await conversation.save();

    // Notify sender that message was read
    const senderSocketId = getReceiverSocketId(message.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageRead", { 
        messageId: message._id,
        readAt: message.readAt 
      });
    }

    res.status(200).json({ message: "Message marked as read", messageId });
  } catch (error) {
    console.error("Error marking message as read:", error);
    next(error);
  }
};

// ✅ NEW: Mark all messages as read
export const markAllAsRead = async (req, res, next) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    // Validate otherUserId
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Create sorted participants array
    const participants = [myId.toString(), otherUserId].sort();

    // Find conversation
    const conversation = await Conversation.findOne({
      participants: { $all: participants },
      $expr: { $eq: [{ $size: "$participants" }, 2] }
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Mark all unread messages as read
    let markedCount = 0;
    conversation.messages.forEach(msg => {
      if (msg.receiverId.toString() === myId.toString() && msg.status !== 'read') {
        msg.status = 'read';
        msg.readAt = new Date();
        markedCount++;
      }
    });

    // Reset unread count for this user
    conversation.unreadCount.set(myId.toString(), 0);

    await conversation.save();

    // Notify sender
    const senderSocketId = getReceiverSocketId(otherUserId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("allMessagesRead", { 
        userId: myId,
        conversationId: conversation._id 
      });
    }

    res.status(200).json({ 
      message: "All messages marked as read", 
      count: markedCount 
    });
  } catch (error) {
    console.error("Error marking all messages as read:", error);
    next(error);
  }
};

export const searchMessages = async (req, res, next) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters long" });
    }

    // Find all conversations for this user
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'fullName profilePic');

    // Search messages across all conversations
    const searchResults = [];
    
    conversations.forEach(conversation => {
      conversation.messages.forEach(message => {
        if (message.text && message.text.toLowerCase().includes(query.toLowerCase())) {
          searchResults.push({
            ...message.toObject(),
            conversationId: conversation._id,
            participants: conversation.participants
          });
        }
      });
    });

    // Sort by most recent first
    searchResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Limit results
    const limitedResults = searchResults.slice(0, 50);

    res.status(200).json(limitedResults);
  } catch (error) {
    next(error);
  }
};