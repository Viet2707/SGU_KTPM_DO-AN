import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true }, // menu name
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Warehouse", warehouseSchema);
