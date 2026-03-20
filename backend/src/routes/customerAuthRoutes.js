import express from "express";
import {
  registerCustomer,
  loginCustomer,
} from "../controllers/customerAuthController.js";
import protectCustomer from "../middleware/authCustomer.js";

const router = express.Router();

// Register Customer
router.post("/register", registerCustomer);

// Login Customer
router.post("/login", loginCustomer);

export default router;
