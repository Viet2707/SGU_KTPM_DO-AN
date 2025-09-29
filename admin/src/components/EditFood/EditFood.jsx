import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { url } from "../../assets/assets";

const EditFood = ({ food, onClose, refreshList }) => {
  const [form, setForm] = useState({
    id: food._id,
    name: food.name || "",
    description: food.description || "",
    price: food.price || 0,
    categoryId: "", // lưu categoryId real
    image: null,
    previewImage: food.image ? `${url}/images/${food.image}` : null,
  });

  const [categories, setCategories] = useState([]);

  // Fetch categories for <select>
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${url}/api/categories`);
      if (res.data.success) {
        setCategories(res.data.categories);
        // Set default: categoryId trùng food.category hiện tại
        const cat = res.data.categories.find(
          (c) => c.name === food.category // backend trả về tên danh mục
        );
        if (cat) {
          setForm((prev) => ({ ...prev, categoryId: cat._id }));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh mục");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form submit
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("id", form.id);
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("categoryId", form.categoryId);
      if (form.image) formData.append("image", form.image);

      const res = await axios.put(`${url}/api/food/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Cập nhật sản phẩm thành công!");
        refreshList();
        onClose();
      } else {
        toast.error(res.data.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi khi cập nhật sản phẩm");
    }
  };

  return (
    <div className="edit-modal">
      <div className="edit-form">
        <h3>✏️ Sửa sản phẩm</h3>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Tên sản phẩm"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Mô tả"
        />
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Giá"
        />

        {/* Upload ảnh */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm({
              ...form,
              image: e.target.files[0],
              previewImage: URL.createObjectURL(e.target.files[0]),
            })
          }
        />
        {form.previewImage && (
          <img
            src={form.previewImage}
            alt="preview"
            style={{ width: 100, marginTop: 10 }}
          />
        )}

        {/* Select danh mục */}
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Action buttons */}
        <div style={{ marginTop: 20 }}>
          <button onClick={handleUpdate}>💾 Lưu</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            ❌ Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFood;