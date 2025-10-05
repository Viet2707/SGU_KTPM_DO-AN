import express from "express";
import { loginAdmin } from "../controllers/adminController.js";
// import { listUsers, updateUserStatus } from "../controllers/adminController.js";
// import adminAuth from "../middleware/adminAuth.js";


const router = express.Router();
router.post("/login", loginAdmin);
// router.get("/", adminAuth, listUsers);
// router.patch("/:id/status", adminAuth, updateUserStatus);
export default router;

