import   { useEffect, useState } from 'react';

function decodeAdmin() {
  const token = localStorage.getItem('admin_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload; // { id, role, email, name?, iat, exp }
  } catch {
    return null;
  }
}

export default function AdminHeader() {
  const [admin, setAdmin] = useState(null);

   useEffect(() => {
    const p = decodeAdmin();
    console.log('Decoded admin:', p); // debug
    setAdmin(p);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
      // localStorage.removeItem("token"); // ❗ Xóa luôn token người dùng

    window.location.replace("http://localhost:5173/?logout=1");
  };

  return (
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'#e8f5e9',borderBottom:'1px solid #c8e6c9'}}>
      <h1 style={{margin:0}}>🌿 Trang Quản Trị</h1>
      {admin ? (
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <span>Xin chào, <b>{admin.name || admin.email}</b></span>
          <button onClick={handleLogout}>Đăng xuất</button>
        </div>
      ) : (
        <span>Chưa đăng nhập</span>
      )}
    </header>
  );
}
