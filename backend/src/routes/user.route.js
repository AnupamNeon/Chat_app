import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getUsersForSidebar, 
  getUserProfile, 
  updateUserStatus 
} from "../controllers/user.controller.js";
import { generalLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.get("/sidebar", protectRoute, generalLimiter, getUsersForSidebar);
router.get("/:userId", protectRoute, getUserProfile);
router.patch("/status", protectRoute, updateUserStatus);

export default router;