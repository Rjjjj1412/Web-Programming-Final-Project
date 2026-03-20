import express from "express";
import {
  getCategoriesByGenre,
  getCategoriesByIds,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/by-genre", getCategoriesByGenre);

router.get("/by-ids", getCategoriesByIds);

export default router;
