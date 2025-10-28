// admin/src/App.jsx
import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import AdminHeader from "./components/Adminheader/Adminheader";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Stock from "./pages/Stock/Stock";
import Users from "./pages/Users/Users";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ADMIN_TOKEN_KEY = "admin_token";

function getUserAppUrl() {
  if (typeof window === "undefined") return "/";
  // Runtime env (public/env.js) ưu tiên
  if (window.__ENV?.USER_APP_URL) return window.__ENV.USER_APP_URL;
  // Build-time env (Vite)
  if (import.meta?.env?.VITE_USER_APP_URL) return import.meta.env.VITE_USER_APP_URL;
  // Fallback: cùng host, port - 1
  const { protocol, hostname, port } = window.location;
  if (port) return `${protocol}//${hostname}:${Math.max(Number(port) - 1, 1)}`;
  return `${protocol}//${hostname}`;
}

function buildUserLoginUrl() {
  const base = getUserAppUrl();
  try {
    const url = new URL("/login", base); // đổi nếu login path khác
    url.searchParams.set("from", "admin");
    url.searchParams.set("redirect", window.location.href);
    return url.toString();
  } catch {
    return base || "/";
  }
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || "");

  // Nhận token từ query (?token=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("token");
    if (t) {
      localStorage.setItem(ADMIN_TOKEN_KEY, t);
      setToken(t);
      // Xoá query, giữ nguyên path
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  // Đồng bộ token giữa các tab
  useEffect(() => {
    const onStorage = (e) => { if (e.key === ADMIN_TOKEN_KEY) setToken(e.newValue || ""); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const userBaseUrl = useMemo(() => getUserAppUrl(), []);
  const loginUrl = useMemo(() => buildUserLoginUrl(), [location.key]);

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <h2>🚫 Bạn chưa đăng nhập quyền quản trị.</h2>
        <p style={{ marginTop: 8 }}>
          Vui lòng quay lại
         <a
  href={`${userBaseUrl}?logout=true`}
  onClick={() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY); // xoá token admin trước
  }}
  style={{ color: "blue", textDecoration: "underline" }}
>
  trang người dùng
</a>
        </p>

      
        </div>
    
    );
  }

  return (
    <div className="app">
      <ToastContainer />
      <AdminHeader />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/add" element={<Add />} />
          <Route path="/list" element={<List />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </div>
    </div>
  );
}