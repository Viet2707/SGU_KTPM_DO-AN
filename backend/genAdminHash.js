import bcrypt from "bcrypt";

const password = "vietdeptrai123";

bcrypt.hash(password, 10)
  .then(hash => {
    console.log("✅ Hash tạo ra cho mật khẩu:", password);
    console.log(hash);
  })
  .catch(err => console.error("Lỗi:", err));
// Chạy lệnh: node backend/controllers/genAdminHash.js
