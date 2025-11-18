import Admin from "../models/adminModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "123";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📩 Login request:", email);

    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log("❌ Không tìm thấy admin:", email);
      return res
        .status(401)
        .json({ success: false, message: "Email không tồn tại" });
    }

    const isMatch = await admin.checkPassword(password);
    if (!isMatch) {
      console.log("❌ Sai mật khẩu cho admin:", email);
      return res
        .status(401)
        .json({ success: false, message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin", email: admin.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Admin đăng nhập thành công:", email);
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error("🔥 Lỗi đăng nhập admin:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};
