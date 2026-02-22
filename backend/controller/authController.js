import User from "../model/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { genToken, genToken1 } from "../config/token.js";

const isProduction = process.env.NODE_ENV === "production";

// 🔥 Common Cookie Options
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,                 // Production me true
  sameSite: isProduction ? "none" : "lax", // Cross-site allow
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exist" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter valid Email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Enter Strong Password" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword
    });

    const token = await genToken(user._id);

    res.cookie("token", token, cookieOptions);

    return res.status(201).json(user);

  } catch (error) {
    console.log("Registration error:", error);
    return res.status(500).json({ message: "Registration error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, cookieOptions);

    return res.status(200).json(user);

  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({ message: "Login error" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { name, email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, cookieOptions);

    return res.status(200).json(user);

  } catch (error) {
    console.log("Google login error:", error);
    return res.status(500).json({ message: "Google login error" });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = await genToken1(email);

      res.cookie("token", token, {
        ...cookieOptions,
        maxAge: 1 * 24 * 60 * 60 * 1000 // Admin 1 day
      });

      return res.status(200).json({ message: "Admin login successful" });
    }

    return res.status(400).json({ message: "Invalid credentials" });

  } catch (error) {
    console.log("Admin login error:", error);
    return res.status(500).json({ message: "Admin login error" });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax"
    });

    return res.status(200).json({ message: "Logout successful" });

  } catch (error) {
    console.log("Logout error:", error);
    return res.status(500).json({ message: "Logout error" });
  }
};