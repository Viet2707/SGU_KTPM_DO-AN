import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stock from "../models/Stock.js";
import { decStock, incStock } from "./updateStock.js";
import Stripe from "stripe";

// Khởi tạo Stripe với secret key từ file .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Cấu hình
const currency = "vnd"; // Thay đổi thành 'vnd'
const deliveryCharge = 30000; // Phí ship 30.000 vnđ
const frontend_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Hàm trợ giúp để lấy ID và số lượng từ các item trong giỏ hàng
const pickId = (i) => i.foodId || i.productId || i._id || i.id;
const pickQty = (i) => i.quantity || i.qty || 1;

/**
 * @desc Kiểm tra xem tất cả sản phẩm trong đơn hàng có đủ tồn kho không
 */
const assertEnoughStock = async (items) => {
  for (const it of items) {
    const id = pickId(it);
    const qty = pickQty(it);
    const doc = await Stock.findOne({ foodId: id }).select("quantity");
    if (!doc || doc.quantity < qty) {
      const err = new Error("OUT_OF_STOCK");
      err.code = "OUT_OF_STOCK";
      err.message = `Sản phẩm ${it.name} không đủ tồn kho.`;
      throw err;
    }
  }
};

/**
 * @desc Xử lý đặt hàng qua cổng thanh toán (Stripe)
 */
const placeOrder = async (req, res) => {
  try {
    const items = req.body.items || [];
    await assertEnoughStock(items);

    const newOrder = new orderModel({
      userId: req.body.userId,
      items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price,
      },
      quantity: pickQty(item),
    }));
    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Phí giao hàng" },
        unit_amount: deliveryCharge,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    if (error.code === "OUT_OF_STOCK") {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Lỗi khi đặt hàng (Stripe):", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

/**
 * @desc Xử lý đặt hàng nhận tiền mặt (COD)
 */
const placeOrderCod = async (req, res) => {
  try {
    const items = req.body.items || [];
    await assertEnoughStock(items);
    await decStock(items);

    const newOrder = new orderModel({
      userId: req.body.userId,
      items,
      amount: req.body.amount,
      address: req.body.address,
      payment: true,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    res.json({ success: true, message: "Đặt hàng thành công" });
  } catch (error) {
    if (error.code === "OUT_OF_STOCK") {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Lỗi khi đặt hàng (COD):", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

/**
 * @desc Admin lấy danh sách tất cả đơn hàng
 */
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng (Admin):", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

/**
 * @desc User lấy lịch sử đơn hàng của mình
 */
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error)
{
    console.error("Lỗi khi lấy lịch sử đơn hàng (User):", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

/**
 * @desc Admin cập nhật trạng thái đơn hàng
 */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

    const oldStatus = (order.status || "").toLowerCase();
    const newStatus = (status || "").toLowerCase();
    const goingToCancel = newStatus === "canceled" || newStatus === "cancelled";
    const wasCanceled = oldStatus === "canceled" || oldStatus === "cancelled";

    if (goingToCancel && !wasCanceled && order.payment === true) {
      await incStock(order.items);
    }

    await orderModel.findByIdAndUpdate(orderId, { status: status });
    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

/**
 * @desc Xác nhận thanh toán từ Stripe và trừ kho
 */
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

    if (success === "true") {
      if (order.payment) {
        return res.json({ success: true, message: "Đã thanh toán" });
      }
      await decStock(order.items);
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      return res.json({ success: true, message: "Thanh toán thành công" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false, message: "Thanh toán thất bại" });
    }
  } catch (error) {
    if (error.code === "OUT_OF_STOCK") {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Lỗi khi xác nhận thanh toán:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};


// 
// ✅ HÀM MỚI ĐỂ LẤY CHI TIẾT ĐƠN HÀNG
//
const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id; // Lấy ID từ tham số URL
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        res.json({ success: true, data: order });

    } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};


export { 
    placeOrder, 
    listOrders, 
    userOrders, 
    updateStatus, 
    verifyOrder, 
    placeOrderCod,
    getOrderById // <-- THÊM VÀO ĐÂY
};