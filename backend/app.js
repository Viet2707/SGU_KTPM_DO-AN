import express from "express";
import cors from "cors";
import helmet from "helmet";

// Routers
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import stockRoutes from "./routes/stockRoutes.js";
import categoryRoute from "./routes/categoryRoute.js";
import adminRouter from "./routes/adminRoute.js";
import adminUserRoute from "./routes/adminUserRoute.js";

const app = express();

// Security middleware - Sửa các lỗ hổng OWASP ZAP
app.use(helmet());
app.disable('x-powered-by');

app.use(cors());
app.use(express.json());
// Static images với CORP header để fix lỗi cross-origin
app.use("/images", (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
}, express.static("uploads"));

app.get("/", (req, res) => res.send("API Working 🌱"));
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/stocks", stockRoutes);
app.use("/api/category", categoryRoute);
app.use("/api/admin", adminRouter);
app.use("/api/admin/users", adminUserRoute);

export default app;