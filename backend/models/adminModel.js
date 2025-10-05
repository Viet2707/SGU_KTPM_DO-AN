import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, default: "admin" },
  status: { type: String, default: "active" },
  created_at: { type: Date, default: Date.now }
});

adminSchema.methods.checkPassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password_hash);
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;

