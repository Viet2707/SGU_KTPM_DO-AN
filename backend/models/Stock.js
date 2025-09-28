import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    status: { 
        type: String, 
        enum: ["available", "low stock", "out of stock"], 
        default: "available" 
    },
    lastUpdated: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for better performance and prevent duplicates
stockSchema.index({ warehouseId: 1, foodId: 1 }, { unique: true });

export default mongoose.models.Stock || mongoose.model("Stock", stockSchema);