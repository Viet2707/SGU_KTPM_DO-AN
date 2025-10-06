import express from "express";
import { listUsers, updateUserStatus } from "../controllers/adminUserController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();
router.get("/", adminAuth, listUsers);
router.patch("/:id/status", adminAuth, updateUserStatus);

export default router;
