import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, default: 0 }
});

export default mongoose.model("Stock", stockSchema);
