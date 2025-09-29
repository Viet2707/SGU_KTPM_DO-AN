import Food from "../models/Food.js";
import Stock from "../models/Stock.js";
import fs from "fs";

// 📌 Lấy toàn bộ Food + populate category + quantity từ Stock
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

// 📌 Thêm Food (Stock mặc định 0)
export const addFood = async (req, res) => {
  try {
    const { name, description, price, categoryId } = req.body;
    if (!price || isNaN(price)) {
      return res.status(400).json({ success: false, message: "Price không hợp lệ" });
    }

    const image = req.file ? req.file.filename : null;

    const food = await Food.create({
      name,
      description,
      price: Number(price),
      categoryId,
      image,
    });

    await Stock.create({ foodId: food._id, quantity: 0 });

    res.json({ success: true, message: "Food & Stock created", data: food });
  } catch (error) {
    console.error("❌ addFood error:", error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

// 📌 Update Food (có thể đổi categoryId, ảnh)
export const updateFood = async (req, res) => {
  try {
    const { id, name, description, price, categoryId } = req.body;

    let updateData = {
      name,
      description,
      price: Number(price),
      categoryId,
    };

    if (req.file) {
      const food = await Food.findById(id);
      if (food?.image) {
        fs.unlink(`uploads/${food.image}`, (err) => {
          if (err && err.code !== "ENOENT") console.error("❌ unlink image error:", err);
        });
      }
      updateData.image = req.file.filename;
    }

    const updatedFood = await Food.findByIdAndUpdate(id, updateData, { new: true })
      .populate("categoryId", "name");

    if (!updatedFood) {
      return res.json({ success: false, message: "Không tìm thấy sản phẩm" });
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

// 📌 Xoá Food + Stock + Ảnh
export const removeFood = async (req, res) => {
  try {
    const food = await Food.findById(req.body.id);
    if (!food) return res.json({ success: false, message: "Food not found" });

    if (food.image) {
      fs.unlink(`uploads/${food.image}`, (err) => {
        if (err && err.code !== "ENOENT") console.error("❌ unlink error:", err);
      });
    }

    await Stock.deleteOne({ foodId: food._id });
    await food.deleteOne();

    res.json({ success: true, message: "Food & Stock removed" });
  } catch (error) {
    console.error("❌ removeFood error:", error);
    res.status(500).json({ success: false, message: "Error" });
  }
};