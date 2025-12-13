import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData:{type:Object,default:{}},
    status: { type: String, enum: ["unlock", "lock"], default: "unlock" }, // 👈
  created_at: { type: Date, default: Date.now },
    
}, { minimize: false })

// Ensure unique index on email
userSchema.index({ email: 1 }, { unique: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;