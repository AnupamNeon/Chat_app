import { createUser, validateUser } from "../middleware/auth.middleware.js";
import { generateToken } from "../utils/jwt.utils.js";
import { CloudinaryService } from "../services/cloudinary.service.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/customError.js";

export const signup = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Additional validation
    if (!fullName || !email || !password) {
      throw new AppError('All fields are required', 400);
    }

    const user = await createUser({ fullName, email, password });
    
    generateToken(user._id, res);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Additional validation
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await validateUser(email, password);
    
    user.isOnline = true;
    await user.save();

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isOnline: user.isOnline,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Update online status
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { 
        isOnline: false,
        lastSeen: new Date()
      });
    }

    res.cookie("jwt", "", { 
      maxAge: 0,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
    });
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    // Validate base64 string
    if (!profilePic.startsWith('data:image/')) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    const { url } = await CloudinaryService.uploadImage(profilePic, 'chat_app/profiles');
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: url },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const checkAuth = (req, res) => {
  res.status(200).json(req.user);
};