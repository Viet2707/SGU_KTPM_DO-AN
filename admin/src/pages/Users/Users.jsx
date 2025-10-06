// admin/src/pages/Users/Users.jsx
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { toast } from "react-toastify";

export default function Users() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchUsers = async () => {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (status) qs.set("status", status);
    const res = await api(`/api/admin/users?${qs.toString()}`);
    if (res?.success) setList(res.data || []);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggle = async (u) => {
    const next = u.status === "lock" ? "unlock" : "lock";
    const res = await api(`/api/admin/users/${u._id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: next }),
    });
    if (res?.success) {
      toast.success(res.message || "Cập nhật thành công");
      setList(prev => prev.map(x => x._id === u._id ? { ...x, status: next } : x));
    }
  };

  return (
    <div style={{ padding: 16, width: "100%" }}>
      <h2>👥 Quản lý người dùng</h2>
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input placeholder="Tìm tên/email…" value={search} onChange={e=>setSearch(e.target.value)} style={{ padding:8, flex:1 }}/>
        <select value={status} onChange={e=>setStatus(e.target.value)} style={{ padding:8 }}>
          <option value="">Tất cả</option>
          <option value="unlock">Đang mở</option>
          <option value="lock">Đã khóa</option>
        </select>
        <button onClick={fetchUsers} style={{ padding:"8px 12px" }}>Lọc</button>
      </div>

      <table width="100%" cellPadding="8" style={{ borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:"#f4f6f8" }}>
            <th align="left">Tên</th>
            <th align="left">Email</th>
            <th align="left">Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {list.map(u => (
            <tr key={u._id} style={{ borderTop:"1px solid #eee" }}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.status === "lock" ? "🔒 Khóa" : "🔓 Mở"}</td>
              <td align="center">
                <button onClick={() => toggle(u)}>
                  {u.status === "lock" ? "Mở khóa" : "Khóa"}
                </button>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td colSpan="4" align="center" style={{ padding:24 }}>Không có dữ liệu</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
