import { useEffect } from "react";
import PropTypes from "prop-types";

export default function AdminProtected({ children }) {
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      window.location.href = "http://localhost:5173";
    }
  }, [token]);

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <h2>🚫 Bạn chưa đăng nhập quyền quản trị. Đang chuyển hướng...</h2>
      </div>
    );
  }

  return children;
}

AdminProtected.propTypes = {
  children: PropTypes.node.isRequired,
};
