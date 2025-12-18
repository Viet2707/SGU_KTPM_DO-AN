import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stock from "../models/Stock.js";
import { decStock, incStock } from "./updateStock.js";

// Khởi tạo Stripe với secret key từ file .env
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
const placeOrderCod = async (req, res) => {
  try {
    const items = req.body.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Thiếu danh sách sản phẩm" });
    }

    // Kiểm tra & trừ kho
    await assertEnoughStock(items);
    await decStock(items);

    const newOrder = new orderModel({
      userId: req.body.userId,
      items,
      amount: req.body.amount,          // ví dụ: tổng phụ + phí ship (tính ở FE/BE đều được)
      address: req.body.address,
      paymentMethod: "COD",             // <-- thêm field trong schema nếu chưa có
      payment: false,                   // CHƯA THU TIỀN
      status: "Food Processing",
    });

    await newOrder.save();

    // Xoá giỏ hàng user
    if (req.body.userId) {
      await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
    }

    return res.json({
      success: true,
      message: "Đặt hàng thành công. Bạn sẽ thanh toán khi nhận hàng (COD).",
      orderId: newOrder._id,
    });
  } catch (error) {
    if (error.code === "OUT_OF_STOCK") {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Lỗi khi đặt hàng (COD):", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
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
 * - KHÔNG lọc theo payment để user thấy cả đơn COD chưa giao/ chưa thu tiền
 */
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.body.userId })
      .sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đơn hàng (User):", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

/**
 * @desc Admin cập nhật trạng thái đơn hàng
 * - Khi chuyển sang Delivered và là COD -> coi như đã thu tiền (payment=true, paidAt=now)
 * - BỎ HOÀN KHO khi Cancel theo yêu cầu
 */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    const curr = (order.status || "").toLowerCase();
    const next = (status || "").toLowerCase();

    // Đã chốt (Delivered/Canceled) thì KHÔNG cho đổi nữa
    if ((curr === "delivered" || curr === "canceled") && next !== curr) {
      return res.status(400).json({
        success: false,
        message: "Đơn đã chốt trạng thái, không thể thay đổi.",
      });
    }

    // Chuẩn bị cập nhật
    const update = { status };

    // 1) Delivered: chốt đơn, thanh toán thành công
    if (next === "delivered") {
      if (!order.payment) {
        update.payment = true;
        update.paidAt = new Date();
      }
    }

    // 2) Canceled: chốt đơn, chưa thanh toán, hoàn kho (chỉ 1 lần)
    if (next === "canceled") {
      update.payment = false;

      if (curr !== "canceled") {
        // Hoàn kho chỉ khi chuyển sang canceled lần đầu
        try {
          await incStock(order.items);
        } catch (e) {
          console.error("Hoàn kho khi canceled lỗi:", e);
          // có thể quyết định trả lỗi nếu hoàn kho thất bại
        }
      }
    }

    await orderModel.findByIdAndUpdate(orderId, update, { new: true });
    return res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};
/**
 * @desc Lấy chi tiết đơn hàng theo ID
 */
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
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

const placeOrder = placeOrderCod;
export {
  placeOrder,
  listOrders,
  userOrders,
  updateStatus,

  placeOrderCod,
  getOrderById // <-- THÊM VÀO ĐÂY
};