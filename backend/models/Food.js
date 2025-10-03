import mongoose from "mongoose";

const FoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }
  },
  { timestamps: true }
);

// ✅ Không cho phép trùng name + categoryId
FoodSchema.index({ name: 1, categoryId: 1 }, { unique: true });

export default mongoose.model("Food", FoodSchema);