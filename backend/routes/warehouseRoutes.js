import express from "express";
import { createWarehouse, listWarehouses, viewStock, addStock, updateStock } from "../controllers/warehouseController.js";

const router = express.Router();

router.post("/create", createWarehouse);
router.get("/list", listWarehouses);
router.get("/:warehouseId/stocks", viewStock);
router.post("/add-stock", addStock);
router.post("/update-stock", updateStock);

export default router;
