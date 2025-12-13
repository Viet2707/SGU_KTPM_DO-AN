import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData:{type:Object,default:{}},
    status: { type: String, enum: ["unlock", "lock"], default: "unlock" }, // 👈
  created_at: { type: Date, default: Date.now },
    
}, { minimize: false })

// Unique constraint handled by schema definition

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;