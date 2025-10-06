import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export class AuthService {
  static async createUser(userData) {
    const { fullName, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await user.save();
    return user;
  }

  static async validateUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error('Invalid credentials');
    }

    return user;
  }
}