import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
    quantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Stock", stockSchema);