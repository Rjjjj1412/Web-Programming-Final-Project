import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoryById,
  checkCategoryName,
} from "../controllers/adminCategoryController.js";
import protectAdmin from "../middleware/authAdmin.js";

const router = express.Router();

// Check category name exists
router.get("/check-name/:name", protectAdmin, checkCategoryName);

// Create a new category
router.post("/", protectAdmin, createCategory);

// Get all categories
router.get("/", protectAdmin, getAllCategories);

// Get category by ID
router.get("/:id", protectAdmin, getCategoryById);

// Update category by ID
router.patch("/:id", protectAdmin, updateCategory);

// Delete category by ID
router.delete("/:id", protectAdmin, deleteCategory);

export default router;
