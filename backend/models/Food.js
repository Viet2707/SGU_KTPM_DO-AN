import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  image: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }
}, { timestamps: true });

export default mongoose.model("Food", foodSchema);