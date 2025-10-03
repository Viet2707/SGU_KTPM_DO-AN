import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } 
  from "../controllers/categoryController.js";

const router = express.Router();

router.get("/list", getCategories);  // ✅ FE Add.jsx gọi /api/category/list
router.get("/", getCategories);      // GET /api/category
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;