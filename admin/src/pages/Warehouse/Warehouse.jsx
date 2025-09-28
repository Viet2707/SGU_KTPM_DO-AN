import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Warehouse.css";

export default function Warehouse() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/warehouses/categories");
        if (res.data?.success && Array.isArray(res.data.categories)) {
          setCategories(res.data.categories);
        } else {
          console.error("Dữ liệu kho hàng không hợp lệ:", res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu kho hàng:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="warehouse-container">
      <h2>📦 Kho hàng</h2>

      {categories.length === 0 && <p>Không có sản phẩm trong kho.</p>}

      {categories.map((cat, idx) => (
        <div key={idx} className="category-section">
          {/* Hiển thị tên danh mục */}
          <h3>{cat.category || "Danh mục không tên"}</h3>

          <div className="foods-grid">
            {Array.isArray(cat.foods) && cat.foods.length > 0 ? (
              cat.foods.map((food) => (
                <div key={food._id} className="food-card">
                  <img
                    src={
                      food.image
                        ? `http://localhost:5000/images/${food.image}`
                        : "/images/default.png" // ảnh mặc định
                    }
                    alt={food.name || "Không có tên"}
                    className="food-image"
                  />
                  <h4>{food.name || "Không có tên"}</h4>
                  <p>
                    {food.price != null
                      ? Number(food.price).toLocaleString()
                      : "0"}{" "}
                    VND
                  </p>
                  <p>{food.description || "Không có mô tả"}</p>
                </div>
              ))
            ) : (
              <p>Không có sản phẩm trong danh mục này.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
