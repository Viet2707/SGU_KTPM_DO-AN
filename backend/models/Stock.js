import mongoose from "mongoose";

const StockSchema = new mongoose.Schema(
  {
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
    quantity: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Stock", StockSchema);