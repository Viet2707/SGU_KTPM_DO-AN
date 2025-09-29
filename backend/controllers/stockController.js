import Stock from "../models/Stock.js";
import Food from "../models/Food.js";

// 📌 Lấy toàn bộ stocks kèm food + category
export const getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find()
      .populate({
        path: "foodId",
        select: "name description price image categoryId",
        populate: { path: "categoryId", select: "name" }
      });

    const result = stocks.map(stock => ({
      _id: stock._id,
      quantity: stock.quantity,
      updatedAt: stock.updatedAt,
      foodInfo: stock.foodId,
      categoryInfo: stock.foodId?.categoryId
    }));

    res.json({ success: true, stocks: result });
  } catch (err) {
    console.error("❌ getAllStocks error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📌 Tạo mới Food + Stock (có upload ảnh)
export const createStock = async (req, res) => {
  try {
    const { name, description, price, categoryId, quantity } = req.body;
    const image = req.file ? req.file.filename : null;

    // tạo sản phẩm mới
    const food = await Food.create({
      name,
      description,
      price: Number(price),
      categoryId,
      image,
    });

    // tạo kho cho sản phẩm đó
    const stock = await Stock.create({
      foodId: food._id,
      quantity: Number(quantity) || 0,
    });

    res.json({ success: true, food, stock });
  } catch (err) {
    console.error("❌ createStock error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📌 Update Food (có thể thay đổi ảnh/category nếu upload mới)
export const updateStock = async (req, res) => {
  try {
    const { foodId } = req.params;
    let updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const food = await Food.findByIdAndUpdate(foodId, updateData, { new: true })
      .populate("categoryId", "name");

    if (!food) {
      return res.status(404).json({ success: false, message: "Food không tồn tại" });
    }

    res.json({ success: true, food });
  } catch (err) {
    console.error("❌ updateStock error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📌 Delete Stock + Xoá luôn Food tương ứng
export const deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.stockId);

    if (!stock) {
      return res.status(404).json({ success: false, message: "Không tìm thấy stock" });
    }

    // Xoá Food liên quan
    await Food.findByIdAndDelete(stock.foodId);

    // Xoá Stock
    await Stock.findByIdAndDelete(req.params.stockId);

    res.json({ success: true, message: "Đã xoá Food + Stock" });
  } catch (err) {
    console.error("❌ deleteStock error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📌 Thay đổi số lượng stock
export const changeQuantity = async (req, res) => {
  try {
    const { foodId, qty } = req.body;
    const stock = await Stock.findOne({ foodId });

    if (!stock) {
      return res.status(404).json({ success: false, message: "Không tìm thấy stock" });
    }

    stock.quantity += Number(qty) || 0;
    if (stock.quantity < 0) stock.quantity = 0;
    await stock.save();

    res.json({ success: true, stock });
  } catch (err) {
    console.error("❌ changeQuantity error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};