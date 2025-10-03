import Food from "../models/Food.js";
import Stock from "../models/Stock.js";
import fs from "fs";

// 📌 List all foods
export const listFood = async (req, res) => {
  try {
    const foods = await Food.find().populate("categoryId", "name");

    const data = await Promise.all(
      foods.map(async (food) => {
        const stock = await Stock.findOne({ foodId: food._id });
        return {
          _id: food._id,
          name: food.name,
          description: food.description,
          price: food.price,
          image: food.image,
          category: food.categoryId?.name || "",
          quantity: stock ? stock.quantity : 0,
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    console.error("❌ listFood error:", error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

// 📌 Add Food
export const addFood = async (req, res) => {
  try {
    const { name, description, price, categoryId } = req.body;
    const image = req.file ? req.file.filename : null;

    const existing = await Food.findOne({ name, categoryId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm này đã tồn tại trong danh mục. Vui lòng nhập thêm số lượng trong kho."
      });
    }

    const food = await Food.create({
      name: name.trim(),
      description,
      price: Number(price),
      categoryId,
      image
    });

    await Stock.create({ foodId: food._id, quantity: 0 });

    res.json({ success: true, message: "Đã thêm sản phẩm mới", food });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm đã tồn tại (DB unique). Vui lòng nhập kho."
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Update Food
export const updateFood = async (req, res) => {
  try {
    const { id } = req.params; // ✅ Lấy ID từ URL params
    const { name, description, price, categoryId } = req.body;

    // ✅ Validate ID
    if (!id || id === "undefined") {
      return res.status(400).json({ 
        success: false, 
        message: "ID không hợp lệ" 
      });
    }

    let updateData = { 
      name: name.trim(), 
      description, 
      price: Number(price), 
      categoryId 
    };

    // ✅ Xử lý ảnh mới
    if (req.file) {
      const food = await Food.findById(id);
      if (food?.image) {
        fs.unlink(`uploads/${food.image}`, (err) => {
          if (err && err.code !== "ENOENT") console.error("❌ unlink error:", err);
        });
      }
      updateData.image = req.file.filename;
    }

    const updatedFood = await Food.findByIdAndUpdate(id, updateData, { new: true })
      .populate("categoryId", "name");

    if (!updatedFood) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy sản phẩm" 
      });
    }

    res.json({
      success: true,
      message: "Cập nhật thành công",
      data: {
        _id: updatedFood._id,
        name: updatedFood.name,
        description: updatedFood.description,
        price: updatedFood.price,
        image: updatedFood.image,
        category: updatedFood.categoryId?.name || "",
      },
    });
  } catch (error) {
    console.error("❌ updateFood error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Delete Food
export const removeFood = async (req, res) => {
  try {
    const food = await Food.findById(req.body.id);
    if (!food) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy sản phẩm" 
      });
    }

    if (food.image) {
      fs.unlink(`uploads/${food.image}`, (err) => {
        if (err && err.code !== "ENOENT") console.error("❌ unlink error:", err);
      });
    }

    await Stock.deleteOne({ foodId: food._id });
    await food.deleteOne();

    res.json({ success: true, message: "Đã xóa sản phẩm" });
  } catch (error) {
    console.error("❌ removeFood error:", error);
    res.status(500).json({ success: false, message: "Error" });
  }
};