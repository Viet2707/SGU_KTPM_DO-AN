// src/pages/Stock/Stock.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";

export default function Stock() {
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]); // danh sách sản phẩm có sẵn
  const [openCatId, setOpenCatId] = useState(null);

  const [form, setForm] = useState({
    foodId: "",
    quantity: 0,
  });

  const fetchStocks = async () => {
    try {
      const res = await axios.get("/api/stocks");
      setStocks(res.data.stocks || []);
    } catch (err) {
      console.error("❌ Lỗi fetch stocks:", err.response?.data || err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/category/list");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("❌ Lỗi fetch categories:", err.response?.data || err.message);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await axios.get("/api/food/list");
      if (res.data.success) {
        setFoods(res.data.data);
      }
    } catch (err) {
      console.error("❌ Lỗi fetch foods:", err.response?.data || err.message);
    }
  };

  const refreshData = () => {
    fetchStocks();
    fetchCategories();
    fetchFoods();
  };

  useEffect(() => {
    refreshData();
  }, []);

  const toggleCategory = (catId) => {
    setOpenCatId(openCatId === catId ? null : catId);
  };

  const handleChangeQty = async (foodId, qty) => {
    try {
      await axios.post("/api/stocks/change", { foodId, qty });
      fetchStocks();
    } catch (err) {
      console.error("❌ Lỗi change quantity:", err.response?.data || err.message);
    }
  };

  const deleteStock = async (stockId, foodName) => {
    if (window.confirm(`Bạn có chắc muốn xoá ${foodName}?`)) {
      try {
        await axios.delete(`/api/stocks/${stockId}`);
        fetchStocks();
      } catch (err) {
        console.error("❌ Lỗi delete stock:", err.response?.data || err.message);
      }
    }
  };

  const createStock = async () => {
    try {
      await axios.post("/api/stocks", {
        foodId: form.foodId,
        quantity: form.quantity,
      });

      setForm({ foodId: "", quantity: 0 });
      fetchStocks();
    } catch (err) {
      console.error("❌ Lỗi create stock:", err.response?.data || err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🌱 Quản lý kho hàng (Accordion theo danh mục)</h2>

      {/* Nút cập nhật */}
      <button 
        onClick={refreshData} 
        style={{ marginBottom: 15, padding: "6px 14px", cursor: "pointer" }}
      >
        🔄 Cập nhật danh sách
      </button>

      {/* Nhập kho: chọn sản phẩm có sẵn */}
      <h3>➕ Nhập hàng cho sản phẩm có sẵn</h3>
      <select value={form.foodId} onChange={e => setForm({ ...form, foodId: e.target.value })}>
        <option value="">-- Chọn sản phẩm --</option>
        {foods.map(food => (
          <option key={food._id} value={food._id}>
            {food.name} - {food.category} ({food.price} VND)
          </option>
        ))}
      </select>

      <input type="number" placeholder="Số lượng" value={form.quantity} 
             onChange={e => setForm({ ...form, quantity: e.target.value })} />

      <button onClick={createStock}>💾 Nhập kho</button>

      {/* Accordion theo category */}
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
                          <img src={`http://localhost:5000/images/${stock.foodInfo.image}`} style={{ width: 50 }} alt="" />
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
                        {stock.quantity === 0 ? "Hết hàng"
                          : stock.quantity <= 5 ? "Sắp hết"
                          : "Còn hàng"}
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