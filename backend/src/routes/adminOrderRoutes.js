import express from "express";
import {
  processOrder,
  getAllOrders,
  getOrderById,
  deleteOrder,
} from "../controllers/adminOrderController.js";
import protectAdmin from "../middleware/authAdmin.js";

const router = express.Router();

// Get all orders with details
router.get("/", protectAdmin, getAllOrders);

// Get order by ID with details
router.get("/:id", protectAdmin, getOrderById);

// Delete order by ID
router.delete("/:id", protectAdmin, deleteOrder);

// Update order status / payment
router.patch("/:id/process", protectAdmin, processOrder);

export default router;
