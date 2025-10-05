import Admin from "../models/adminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📩 Login request:", email, password);

    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("❌ Không tìm thấy admin:", email);
      return res.status(401).json({ success: false, message: "Email không tồn tại" });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    console.log("🔑 Kết quả so sánh mật khẩu:", valid);

    if (!valid) {
      return res.status(401).json({ success: false, message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin", email: admin.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Admin đăng nhập thành công:", email);
    res.json({ success: true, token });
  } catch (err) {
    console.error("🔥 Lỗi đăng nhập admin:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};
