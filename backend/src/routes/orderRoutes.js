import express from "express";
import {
  placeOrder,
  viewOrderDetails,
  viewOrderHistory,
} from "../controllers/orderController.js";
import protectCustomer from "../middleware/authCustomer.js";

const router = express.Router();

// Place Order
router.post("/", protectCustomer, placeOrder);

// View Order Details by ID
router.get("/:id", protectCustomer, viewOrderDetails);

// View Order History for authenticated customer
router.get("/history/all", protectCustomer, viewOrderHistory);

export default router;
