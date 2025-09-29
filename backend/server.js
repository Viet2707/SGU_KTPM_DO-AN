import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Routers
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import stockRoutes from "./routes/stockRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json());
app.use("/images", express.static("uploads"));

// ---------- Routes ----------
app.get("/", (req, res) => res.send("API Working 🌱"));
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/stocks", stockRoutes);
app.use("/api/categories", categoryRoutes);

// ---------- DB Connect + Start ----------
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/plantshop")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
  })
  .catch(err => console.error("❌ DB Connect Error:", err));