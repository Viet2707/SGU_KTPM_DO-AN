import express from 'express';
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js';
import multer from 'multer';

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
foodRouter.post("/add", upload.single('image'), addFood);
foodRouter.post("/remove", removeFood);

// ✅ Log PUT request
foodRouter.put("/:id", (req, res, next) => {
    console.log("✅ PUT /:id route matched!");
    console.log("📌 ID từ URL:", req.params.id);
    next();
}, upload.single('image'), updateFood);

console.log("✅ Food routes loaded");

export default foodRouter;