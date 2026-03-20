import AdminUser from "../models/AdminUser.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Admin login
export const loginAdmin = async (req, res) => {
  try {
    const { credential, password } = req.body;

    // Basic validation
    if (!credential || !password) {
      return res
        .status(400)
        .json({ message: "Username or Email and Password are required." });
    }

    // Find admin by username OR email
    const admin = await AdminUser.findOne({
      $or: [{ username: credential }, { email: credential }],
    });

    if (!admin) {
      return res.status(404).json({ message: "No admin account found." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        adminId: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1h" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 3600000), // 1 hour
    });

    res.status(200).json({
      message: "Login successful.",
      admin: {
        adminId: admin._id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ message: "Server error." });
  }
};
