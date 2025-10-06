// admin/src/App.jsx
import { Routes, Route } from "react-router-dom";
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

export default function App() {
  const token = localStorage.getItem("admin_token");

  if (!token) {
    // ❌ Không render layout, nên không có component nào gọi API
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <h2>🚫 Bạn chưa đăng nhập quyền quản trị.</h2>
        <p>
          Vui lòng quay lại{" "}
          <a href="http://localhost:5173" style={{ color: "blue" }}>
            trang người dùng
          </a>{" "}
          để đăng nhập admin.
        </p>
      </div>
    );
  }

  // ✅ Chỉ render khi có token
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
