import jwt from "jsonwebtoken";

export default function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res
        .status(401)
        .json({ success: false, message: "Thiếu header Authorization" });

    const token = authHeader.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Token không hợp lệ" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");

    if (decoded.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("❌ Admin Auth Error:", err.message);
    res.status(401).json({ success: false, message: "Xác thực thất bại" });
  }
}
