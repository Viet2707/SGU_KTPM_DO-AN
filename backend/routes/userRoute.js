import express from 'express';
import { loginUser,registerUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
userRouter.get("/status", authMiddleware, (req, res) => {
  res.json({ success: true, status: req.user.status });
});


export default userRouter;