import express from "express";
import {
  generateSalesReport,
  getLowStockItems,
  getRevenueByCategory,
  getTopSellingProducts,
  getOrdersSummary,
} from "../controllers/adminReportController.js";
import protectAdmin from "../middleware/authAdmin.js";

const router = express.Router();

// GET /api/admin/reports/total-sales
router.get("/total-sales", protectAdmin, generateSalesReport);

// GET /api/admin/reports/low-stock
router.get("/low-stock", protectAdmin, getLowStockItems);

// GET /api/admin/reports/revenue-by-category
router.get("/revenue-by-category", protectAdmin, getRevenueByCategory);

// GET /api/admin/reports/top-selling
router.get("/top-selling", protectAdmin, getTopSellingProducts);

// GET /api/admin/reports/orders-summary
router.get("/orders-summary", protectAdmin, getOrdersSummary);

export default router;
