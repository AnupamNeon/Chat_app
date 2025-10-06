import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getMessages, 
  sendMessage, 
  markAsRead,
  markAllAsRead, 
  searchMessages 
} from "../controllers/message.controller.js";
import { validateMessage } from "../middleware/validation.middleware.js";
import { messageLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.get("/search", protectRoute, searchMessages);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, messageLimiter, validateMessage, sendMessage);
router.patch("/:messageId/read", protectRoute, markAsRead);
router.patch("/:id/read-all", protectRoute, markAllAsRead);

export default router;