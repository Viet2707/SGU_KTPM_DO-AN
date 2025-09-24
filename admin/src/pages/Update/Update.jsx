// controllers/foodController.js hoặc thêm vào file foodController có sẵn

import foodModel from "../models/foodModel.js"
import fs from 'fs'

// Update food
const updateFood = async (req, res) => {
    try {
        const { id, name, description, price, category } = req.body;

        // Kiểm tra ID có hợp lệ không
        if (!id) {
            return res.json({ success: false, message: "Food ID is required" });
        }

        // Tìm food item hiện tại
        const existingFood = await foodModel.findById(id);
        if (!existingFood) {
            return res.json({ success: false, message: "Food item not found" });
        }

        // Chuẩn bị dữ liệu update
        const updateData = {};
        
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = Number(price);
        if (category) updateData.category = category;

        // Xử lý upload ảnh mới (nếu có)
        if (req.file) {
            // Xóa ảnh cũ
            if (existingFood.image) {
                fs.unlink(`uploads/${existingFood.image}`, (err) => {
                    if (err) console.log("Error deleting old image:", err);
                });
            }
            updateData.image = req.file.filename;
        }

        // Update food item
        const updatedFood = await foodModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        res.json({ 
            success: true, 
            message: "Food updated successfully",
            data: updatedFood
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating food" });
    }
}

export { updateFood }