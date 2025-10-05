import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Thiếu token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "admin") {
      return res.status(403).json({ success: false, message: "Không có quyền admin" });
    }
    req.admin = payload;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Token không hợp lệ hoặc hết hạn" });
  }
}
