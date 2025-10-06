import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import { io } from "../socket/socket.js";

export const getUsersForSidebar = async (req, res, next) => {
  try {
    const loggedInUserId = req.user._id;
    
    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password")
      .sort({ isOnline: -1, fullName: 1 });

    // Get conversations to include unread counts and last messages
    const conversations = await Conversation.find({
      participants: loggedInUserId
    })
    .populate('participants', 'fullName profilePic isOnline');

    const usersWithChatInfo = users.map(user => {
      const conversation = conversations.find(conv => 
        conv.participants.some(participant => 
          participant._id.toString() === user._id.toString()
        )
      );
      
      const userObj = user.toObject();
      
      return {
        ...userObj,
        unreadCount: conversation?.unreadCount?.get(loggedInUserId.toString()) || 0,
        lastMessage: conversation?.lastMessage || null
      };
    });

    res.status(200).json(usersWithChatInfo);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { isOnline } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isOnline,
        ...(isOnline === false && { lastSeen: new Date() })
      },
      { new: true }
    ).select("-password");

    // Broadcast status change
    io.emit("userStatusChanged", {
      userId: user._id,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};