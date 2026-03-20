import express from "express";
import {
  browseProducts,
  viewProductDetails,
} from "../controllers/productController.js";

const router = express.Router();

// Browse Products
router.get("/", browseProducts);

// View single product details by ID
router.get("/:id", viewProductDetails);

export default router;
