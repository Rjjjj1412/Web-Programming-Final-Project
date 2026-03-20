import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";

const protectAdmin = async (req, res, next) => {
  let token;

  // 1. Check Authorization header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // No token → deny access
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");

    const admin = await AdminUser.findById(decoded.adminId).select(
      "-password_hash"
    );

    // If admin no longer exists → deny access
    if (!admin) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    // Check for admin/manager role
    const userRole = admin.role;
    if (userRole !== "admin" && userRole !== "manager") {
      return res
        .status(403)
        .json({ message: "Forbidden, insufficient privileges" });
    }

    // Attach admin user and proceed
    req.admin = admin;
    next();
  } catch (error) {
    // Any JWT error → deny access
    console.error("Admin token verification failed:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default protectAdmin;
