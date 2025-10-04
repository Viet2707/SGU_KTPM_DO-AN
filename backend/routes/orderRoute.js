import express from 'express';
import authMiddleware from '../middleware/auth.js';
// ✅ BƯỚC 1: Import thêm hàm 'getOrderById' từ controller
import { 
    listOrders, 
    placeOrder, 
    updateStatus, 
    userOrders, 
    verifyOrder, 
    placeOrderCod,
    getOrderById 
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// --- Routes cho Admin ---
orderRouter.get("/list", listOrders); // Lấy danh sách tất cả đơn hàng
orderRouter.post("/status", updateStatus); // Cập nhật trạng thái đơn hàng

// --- Routes cho User ---
orderRouter.post("/place", authMiddleware, placeOrder); // Đặt hàng (thanh toán online)
orderRouter.post("/placecod", authMiddleware, placeOrderCod); // Đặt hàng (COD)
orderRouter.post("/verify", verifyOrder); // Xác nhận thanh toán (VNPAY/Momo callback)
orderRouter.post("/userorders", authMiddleware, userOrders); // Lấy lịch sử đơn hàng của user

// ✅ BƯỚC 2: Thêm route mới để lấy chi tiết đơn hàng theo ID
// Route này có thể dùng cho cả User và Admin
// :id là một tham số động, ví dụ: /api/order/60d21b4667d0d8992e610c85
orderRouter.get("/:id", getOrderById);

export default orderRouter;