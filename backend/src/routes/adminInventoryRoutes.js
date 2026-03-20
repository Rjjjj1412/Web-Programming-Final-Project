import express from "express";
import {
  createInventory,
  getAllInventory,
  updateInventory,
  deleteInventory,
  getInventoryById,
} from "../controllers/adminInventoryController.js";
import protectAdmin from "../middleware/authAdmin.js";

const router = express.Router();

// Create inventory
router.post("/", protectAdmin, createInventory);

// Get all inventory records
router.get("/", protectAdmin, getAllInventory);

// Get inventory by ID
router.get("/:id", protectAdmin, getInventoryById);

// Update inventory by ID
router.patch("/:id", protectAdmin, updateInventory);

// Delete inventory by ID
router.delete("/:id", protectAdmin, deleteInventory);

export default router;
