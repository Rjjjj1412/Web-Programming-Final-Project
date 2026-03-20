import express from "express";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controllers/adminProductController.js";
import protectAdmin from "../middleware/authAdmin.js";

const router = express.Router();

// Create a new product
router.post("/", protectAdmin, createProduct);

// Get all products
router.get("/", protectAdmin, getAllProducts);

// Get product by ID
router.get("/:id", protectAdmin, getProductById);

// Update product by ID
router.patch("/:id", protectAdmin, updateProduct);

// Delete product by ID
router.delete("/:id", protectAdmin, deleteProduct);

export default router;
