import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";

/**
 * PUBLIC middleware — login optional.
 * Used for browsing products, homepage, etc.
 */
export const optionalCustomer = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // No token → continue as guest
  if (!token) {
    req.customer = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");

    const customer = await Customer.findById(decoded.customerId).select(
      "-password_hash"
    );

    req.customer = customer || null;

    next();
  } catch (error) {
    // Expired / invalid → guest mode
    req.customer = null;
    next();
  }
};

/**
 * PROTECTED middleware — requires login.
 * Used for /profile, /orders, etc.
 */
export const protectCustomer = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // No token → BLOCK
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");

    const customer = await Customer.findById(decoded.customerId).select(
      "-password_hash"
    );

    if (!customer) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.customer = customer;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

export default protectCustomer;
