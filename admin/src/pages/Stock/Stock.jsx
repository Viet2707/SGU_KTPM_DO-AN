// src/pages/Stock/Stock.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";

export default function Stock() {
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openCatId, setOpenCatId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    image: null,
    categoryId: "",
    quantity: 0,
  });

  const fetchStocks = async () => {
    const res = await axios.get("/api/stocks");
    setStocks(res.data.stocks || []);
  };

  const fetchCategories = async () => {
    const res = await axios.get("/api/categories");
    setCategories(res.data.categories || []);
  };

  useEffect(() => {
    fetchStocks();
    fetchCategories();
  }, []);

  const toggleCategory = (catId) => {
    setOpenCatId(openCatId === catId ? null : catId);
  };

  const handleChangeQty = async (foodId, qty) => {
    await axios.post("/api/stocks/change", { foodId, qty });
    fetchStocks();
  };

  const deleteStock = async (stockId, foodName) => {
    if (window.confirm(`Bạn có chắc muốn xoá ${foodName}?`)) {
      await axios.delete(`/api/stocks/${stockId}`);
      fetchStocks();
    }
  };

  const createStock = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("categoryId", form.categoryId);
      formData.append("quantity", form.quantity);
      if (form.image) formData.append("image", form.image);

      await axios.post("/api/stocks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm({ name: "", description: "", price: 0, image: null, categoryId: "", quantity: 0 });
      fetchStocks();
    } catch (err) {
      console.error("❌ AxiosError:", err.response?.data || err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🌱 Quản lý kho hàng (Accordion theo danh mục)</h2>

      {/* Form thêm sản phẩm */}
      <h3>➕ Thêm sản phẩm mới</h3>
      <input placeholder="Tên" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Mô tả" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      <input type="number" placeholder="Giá" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
      <input type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files[0] })} />
      <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
        <option value="">Chọn danh mục</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>{cat.name}</option>
        ))}
      </select>
      <input type="number" placeholder="Số lượng" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
      <button onClick={createStock}>💾 Lưu</button>

      {/* Accordion Categories */}
      {categories.map((cat) => {
        const catStocks = stocks.filter((s) => s.categoryInfo?._id === cat._id);

        return (
          <div key={cat._id} style={{ border: "1px solid #ccc", marginTop: 10 }}>
            <div
              style={{ padding: 10, background: "#eee", cursor: "pointer", fontWeight: "bold" }}
              onClick={() => toggleCategory(cat._id)}
            >
              {openCatId === cat._id ? "▼" : "▶"} {cat.name} ({catStocks.length})
            </div>
            {openCatId === cat._id && (
              <table border={1} style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Ảnh</th><th>Tên</th><th>Giá</th><th>Số lượng</th><th>Trạng thái</th><th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {catStocks.length === 0 ? (
                    <tr><td colSpan="6">Không có</td></tr>
                  ) : catStocks.map((stock) => (
                    <tr key={stock._id}>
                      <td>
                        {stock.foodInfo?.image && (
                          <img src={`http://localhost:5000/images/${stock.foodInfo.image}`} style={{ width: 50, height: 50 }} />
                        )}
                      </td>
                      <td>{stock.foodInfo?.name}</td>
                      <td>{stock.foodInfo?.price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                      <td>
                        <button onClick={() => handleChangeQty(stock.foodInfo?._id, -1)} disabled={stock.quantity === 0}>-</button>
                        {stock.quantity}
                        <button onClick={() => handleChangeQty(stock.foodInfo?._id, 1)}>+</button>
                      </td>
                      <td>
                        {stock.quantity === 0 ? "Hết hàng" : stock.quantity <= 5 ? "Sắp hết" : "Còn hàng"}
                      </td>
                      <td>
                        <button onClick={() => handleChangeQty(stock.foodInfo?._id, 5)}>+5</button>
                        <button onClick={() => handleChangeQty(stock.foodInfo?._id, -5)}>-5</button>
                        <button style={{ color: "white", background: "red", marginLeft: 4 }}
                          onClick={() => deleteStock(stock._id, stock.foodInfo?.name)}>🗑 Xoá</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}