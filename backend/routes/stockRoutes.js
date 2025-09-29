import express from "express";
import upload from "../middleware/upload.js";
import {
  getAllStocks,
  createStock,
  updateStock,
  deleteStock,
  changeQuantity,
} from "../controllers/stockController.js";

const router = express.Router();

// Lấy toàn bộ stocks
router.get("/", getAllStocks);

// Tạo Food + Stock (có upload file ảnh)
router.post("/", upload.single("image"), createStock);

// Update Food (có thể thay ảnh)
router.put("/:foodId", upload.single("image"), updateStock);

// Xoá Stock
router.delete("/:stockId", deleteStock);

// Thay đổi số lượng Stock
router.post("/change", changeQuantity);

export default router;