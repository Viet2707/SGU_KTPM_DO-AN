// controllers/stockController.js
import Food from "../models/Food.js";

export const updateStock = async (req, res) => {
  try {
    const { foodId } = req.params;
    const updateData = { ...req.body };

    // Nếu có ảnh mới upload thì thêm vào updateData.image
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