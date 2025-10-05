// src/lib/api.js
export function getAdminInfo() {
  const token = localStorage.getItem("admin_token");
  if (!token) return null;

  // Giải mã payload trong JWT (phần giữa)
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload; // { id, role, email, iat, exp }
  } catch {
    return null;
  }
}

// admin/src/lib/api.js
export async function api(path, options = {}) {
  const token = localStorage.getItem("admin_token");
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };

  const res = await fetch(`http://localhost:5000${path}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    // Chỉ redirect khi ĐÃ đăng nhập (có token) mà bị từ chối
    if (token) {
      localStorage.removeItem("admin_token");
      window.location.href = "http://localhost:5173/?logout=1";
      return null;
    }
    // Chưa có token -> đừng redirect, để UI hiển thị "chưa đăng nhập"
    return null;
  }

  return res.json();
}

