// FILE: g:\Chat-App\backend\src\models\conversation.model.js
import mongoose from "mongoose";

const messageSubSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    messages: [messageSubSchema],
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    lastMessage: {
      type: messageSubSchema,
    },
  },
  { timestamps: true }
);

// ✅ FIXED: Pre-save hook to always sort participants
conversationSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('participants')) {
    // Convert ObjectIds to strings, sort, then convert back
    this.participants = this.participants
      .map(p => p.toString())
      .sort()
      .map(p => new mongoose.Types.ObjectId(p));
  }
  next();
});

// Index for better query performance
conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ "messages.createdAt": 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;