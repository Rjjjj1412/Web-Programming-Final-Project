import express from "express";
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "../controllers/customerController.js";
import protectCustomer from "../middleware/authCustomer.js";

const router = express.Router();

// Get Customer Profile
router.get("/profile", protectCustomer, getCustomerProfile);

// Update Customer Profile
router.patch("/profile", protectCustomer, updateCustomerProfile);

export default router;
