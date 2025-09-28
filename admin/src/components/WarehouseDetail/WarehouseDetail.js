import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WarehouseDetail.css"; // file CSS riêng cho giao diện

export default function WarehouseDetail() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/warehouses/categories")
      .then((res) => setCategories(res.data.categories))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="warehouse-container">
      <h2>📦 Kho hàng - Theo danh mục</h2>
      {categories.map((cat, idx) => (
        <div key={idx} className="category-section">
          <h3>{cat.category}</h3>
          <div className="foods-grid">
            {cat.foods.map((food) => (
              <div key={food._id} className="food-card">
                <img
                  src={`http://localhost:5000/uploads/${food.image}`}
                  alt={food.name}
                  className="food-image"
                />
                <h4>{food.name}</h4>
                <p>{food.price.toLocaleString()} VND</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
