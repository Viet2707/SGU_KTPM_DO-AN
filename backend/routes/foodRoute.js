import express from 'express';
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js';
import multer from 'multer';
import adminAuth from '../middleware/adminAuth.js';

const foodRouter = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// ✅ Log tất cả requests
foodRouter.use((req, res, next) => {
    console.log(`🔥 Food Router: ${req.method} ${req.originalUrl}`);
    next();
});

foodRouter.get("/list", listFood);
foodRouter.post("/add", adminAuth, upload.single('image'), addFood);
foodRouter.post("/remove", adminAuth, removeFood);

// ✅ Log PUT request
foodRouter.put("/update/:id", (req, res, next) => {
    console.log("✅ PUT /update/:id route matched!");
    console.log("📌 ID từ URL:", req.params.id);
    next();
}, adminAuth, upload.single('image'), updateFood);

console.log("✅ Food routes loaded");

export default foodRouter;