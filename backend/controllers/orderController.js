// controllers/orderController.js
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stock from "../models/Stock.js";
import { decStock, incStock } from "./updateStock.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// config
const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = "http://localhost:5000";

const pickId = (i) => i.foodId || i.productId || i._id || i.id;
const pickQty = (i) => i.quantity || i.qty || 1;

// Kiểm tra tồn theo foodId
const assertEnoughStock = async (items) => {
  for (const it of items) {
    const id = pickId(it);
    const qty = pickQty(it);
    const doc = await Stock.findOne({ foodId: id }).select("quantity");
    if (!doc || doc.quantity < qty) {
      const err = new Error("OUT_OF_STOCK");
      err.code = "OUT_OF_STOCK";
      throw err;
    }
  }
};

// Online payment (Stripe): tạo order, CHƯA trừ kho ở đây
const placeOrder = async (req, res) => {
  try {
    const items = req.body.items || [];

    // 1) check tồn trước
    await assertEnoughStock(items);

    // 2) tạo order (payment: false mặc định)
    const newOrder = new orderModel({
      userId: req.body.userId,
      items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();

    // 3) clear cart
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // 4) stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: pickQty(item),
    }));
    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery Charge" },
        unit_amount: deliveryCharge * 100,
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
      return res.status(409).json({ success: false, message: "Sản phẩm không đủ tồn kho" });
    }
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

// COD: trừ kho NGAY khi đặt
const placeOrderCod = async (req, res) => {
  try {
    const items = req.body.items || [];

    await decStock(items); // trừ kho theo foodId

    const newOrder = new orderModel({
      userId: req.body.userId,
      items,
      amount: req.body.amount,
      address: req.body.address,
      payment: true, // COD coi như đã ghi nhận
    });
    await newOrder.save();

    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    if (error.message === "OUT_OF_STOCK") {
      return res.status(409).json({ success: false, message: "Sản phẩm không đủ tồn kho" });
    }
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

// Admin: danh sách đơn
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

// User: đơn hàng của tôi
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

// Cập nhật trạng thái; nếu chuyển sang canceled -> hoàn kho 1 lần
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const oldStatus = (order.status || "").toLowerCase();
    const newStatus = (status || "").toLowerCase();
    const goingToCancel = newStatus === "canceled" || newStatus === "cancelled";
    const wasCanceled = oldStatus === "canceled" || oldStatus === "cancelled";

    // Nếu lần đầu chuyển sang canceled và đơn đã trừ kho (payment === true) -> cộng trả kho
    if (goingToCancel && !wasCanceled && order.payment === true) {
      await incStock(order.items);
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

// Verify Stripe: thanh toán thành công -> trừ kho rồi set payment = true
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (success === "true") {
      if (order.payment === true) {
        return res.json({ success: true, message: "Paid" });
      }

      try {
        await decStock(order.items);     // trừ kho theo foodId
        await orderModel.findByIdAndUpdate(orderId, { payment: true });
        return res.json({ success: true, message: "Paid" });
      } catch (e) {
        if (e.message === "OUT_OF_STOCK") {
          return res.status(409).json({ success: false, message: "Sản phẩm đã hết/không đủ tồn kho" });
        }
        throw e;
      }
    } else {
      await orderModel.findByIdAndDelete(orderId); // chưa trừ kho nên xóa là xong
      return res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Not Verified" });
  }
};

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder, placeOrderCod };