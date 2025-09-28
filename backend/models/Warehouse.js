import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true }
});

export default mongoose.models.Warehouse || mongoose.model("Warehouse", warehouseSchema);