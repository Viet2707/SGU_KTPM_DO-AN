import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";


const JWT_SECRET = process.env.JWT_SECRET || "123";

const authMiddleware = async (req, res, next) => {
  try {
    // 🔹 Lấy token từ header (có thể là token hoặc Bearer <token>)
    const rawToken = req.headers.token || req.headers.authorization?.split(" ")[1];
    if (!rawToken) {
      return res.status(401).json({ success: false, message: "Không có token. Vui lòng đăng nhập lại." });
    }

    // 🔹 Giải mã token
    const decoded = jwt.verify(rawToken, JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    // 🔹 Không tìm thấy user
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    }

    // 🔹 Nếu tài khoản bị khóa → chặn luôn
    if (user.status === "lock") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    // 🔹 Cho phép qua middleware
    req.user = user;
    req.body.userId = user._id;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

export default authMiddleware;
