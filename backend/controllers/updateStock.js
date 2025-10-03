// controllers/updateStock.js
import Food from "../models/Food.js";
import Stock from "../models/Stock.js";

// Admin cập nhật thông tin Food (không liên quan trừ kho khi đặt)
export const updateStock = async (req, res) => {
  try {
    const { foodId } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const food = await Food.findByIdAndUpdate(foodId, updateData, { new: true });

    if (!food) {
      return res.status(404).json({ success: false, message: "Food không tồn tại" });
    }

    res.json({ success: true, food });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========= HÀM DÙNG KHI ĐẶT/HỦY ĐƠN =========
const pickId = (i) => i.foodId || i.productId || i._id || i.id;
const pickQty = (i) => i.quantity || i.qty || 1;

// Trừ kho theo foodId
export const decStock = async (items, session) => {
  for (const it of items) {
    const id = pickId(it);
    const qty = pickQty(it);

    const res = await Stock.updateOne(
      { foodId: id, quantity: { $gte: qty } },
      { $inc: { quantity: -qty } },
      { session }
    );

    if (!res.modifiedCount) {
      throw new Error("OUT_OF_STOCK");
    }
  }
};

// Cộng trả kho theo foodId
export const incStock = async (items, session) => {
  for (const it of items) {
    const id = pickId(it);
    const qty = pickQty(it);

    await Stock.updateOne(
      { foodId: id },
      { $inc: { quantity: qty } },
      { session }
    );
  }
};