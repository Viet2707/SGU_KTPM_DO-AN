// backend/controllers/seedadmin.js
import "dotenv/config.js";               // để đọc .env
import bcrypt from "bcrypt";
import { connectDB } from "../config/db.js";
import Admin from "../models/adminModel.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@foodfast.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPassword@2024";

async function seedAdmin() {
  try {
    console.log("🔌 Kết nối MongoDB...");
    await connectDB();

    // 👉 Chặn luôn: nếu collection admin đã có ít nhất 1 doc thì không seed nữa
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      const existing = await Admin.findOne({ role: "admin" });
      console.log("⚠️ Collection admin đã có admin, không tạo thêm.");
      if (existing) {
        console.log("➡️ Admin hiện tại:", existing.email);
      }
      process.exit(0);
    }

    // Nếu muốn cực gắt: chỉ cho 1 email này tồn tại
    const existedByEmail = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existedByEmail) {
      console.log("⚠️ Admin với email này đã tồn tại, không tạo thêm.");
      console.log("➡️ Email:", existedByEmail.email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await Admin.create({
      name: "Super Admin",
      email: ADMIN_EMAIL,
      password_hash: hash,
      role: "admin"
    });

    console.log("🎉 Seed admin thành công!");
    console.log("--------------------------------");
    console.log("Email   :", admin.email);
    console.log("Mật khẩu:", ADMIN_PASSWORD);
    console.log("--------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi seed admin:", err);
    process.exit(1);
  }
}

seedAdmin();
