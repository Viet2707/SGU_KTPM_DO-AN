import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, trim: true }
}, {
    timestamps: true
});

// Index để tối ưu query
foodSchema.index({ category: 1 });
foodSchema.index({ name: 1 });
foodSchema.index({ price: 1 });

// Virtual để tạo image URL đầy đủ
foodSchema.virtual('imageUrl').get(function() {
    if (this.image) {
        return `http://localhost:5000/images/${this.image}`;
    }
    return '/images/default.png';
});

// Đảm bảo virtual fields được include khi convert to JSON
foodSchema.set('toJSON', { virtuals: true });
foodSchema.set('toObject', { virtuals: true });

export default mongoose.models.Food || mongoose.model("Food", foodSchema);