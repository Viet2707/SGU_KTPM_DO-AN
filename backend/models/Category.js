import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    foods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }]
}, {
    timestamps: true
});

// Index để tối ưu query
categorySchema.index({ warehouseId: 1, name: 1 });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);