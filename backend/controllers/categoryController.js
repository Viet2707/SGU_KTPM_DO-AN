import Category from "../models/Category.js";

// 📌 Lấy toàn bộ category
export const getCategories = async (req, res) => {
  try {
    const cats = await Category.find();
    res.json({ success: true, categories: cats });
  } catch (err) {
    console.error("❌ getCategories error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📌 Tạo category mới
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.json({ success: false, message: "Tên category không được rỗng" });

    const cat = await Category.create({ name });
    res.json({ success: true, category: cat });
  } catch (err) {
    console.error("❌ createCategory error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📌 Update category
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!cat) return res.json({ success: false, message: "Không tìm thấy category" });
    res.json({ success: true, category: cat });
  } catch (err) {
    console.error("❌ updateCategory error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📌 Xoá category
export const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.json({ success: false, message: "Không tìm thấy category" });
    res.json({ success: true, message: "Đã xoá category" });
  } catch (err) {
    console.error("❌ deleteCategory error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};