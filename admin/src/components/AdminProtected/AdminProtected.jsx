import { useEffect } from "react";
import PropTypes from "prop-types";

export default function AdminProtected({ children }) {
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      // 🔥 Dùng relative URL - hoạt động trong mọi môi trường!
      // Dev: http://localhost:5174 → http://localhost:5173
      // Docker: http://localhost:8081 → http://localhost:8080
      
      // Lấy protocol và hostname hiện tại
      const { protocol, hostname } = window.location;
      
      // Xác định port frontend dựa vào port admin
      const adminPort = window.location.port;
      let frontendPort;
      
      if (adminPort === "5174") {
        // Dev environment
        frontendPort = "5173";
      } else if (adminPort === "8081") {
        // Docker environment
        frontendPort = "8080";
      } else {
        // Fallback: giảm port đi 1
        frontendPort = (parseInt(adminPort) - 1).toString();
      }
      
      const frontendUrl = `${protocol}//${hostname}:${frontendPort}`;
      
      console.log("🔍 Admin port:", adminPort);
      console.log("🔍 Redirecting to:", frontendUrl);
      
      // Redirect sau 2 giây để user đọc thông báo
      setTimeout(() => {
        window.location.href = frontendUrl;
      }, 2000);
    }
  }, [token]);

  if (!token) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "60px",
        maxWidth: "500px",
        margin: "100px auto",
        border: "2px solid #ff6b6b",
        borderRadius: "8px",
        background: "#fff5f5"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔒</div>
        <h2 style={{ color: "#c92a2a" }}>Bạn chưa đăng nhập quyền quản trị</h2>
        <p style={{ fontSize: "16px", margin: "20px 0", color: "#495057" }}>
          Đang tự động chuyển về trang đăng nhập...
        </p>
        
        <div style={{ 
          display: "inline-block",
          width: "40px",
          height: "40px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #228be6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        <p style={{ marginTop: "20px", fontSize: "14px", color: "#868e96" }}>
          Nếu không tự động chuyển, <a href="/" style={{ color: "#228be6" }}>click vào đây</a>
        </p>
      </div>
    );
  }

  return children;
}

AdminProtected.propTypes = {
  children: PropTypes.node.isRequired,
};