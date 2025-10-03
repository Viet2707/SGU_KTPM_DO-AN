import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5000";

const EditFood = ({ food, onClose, refreshList }) => {
  // ✅ Kiểm tra props
  if (!food || !food._id) {
    toast.error("Dữ liệu sản phẩm không hợp lệ");
    onClose?.();
    return null;
  }

  const [form, setForm] = useState({
    id: food._id,
    name: food.name || "",
    description: food.description || "",
    price: food.price || 0,
    categoryId: food.categoryId?._id || "",
    image: null,
    previewImage: food.image ? `${API_URL}/images/${food.image}` : null,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 📌 Lấy danh mục
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/category`);
      if (res.data.success && Array.isArray(res.data.categories)) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Không tải được danh mục");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Cleanup preview URL để tránh memory leak
  useEffect(() => {
    return () => {
      if (form.previewImage && form.previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(form.previewImage);
      }
    };
  }, [form.previewImage]);

  // ✅ Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Tên sản phẩm không được để trống";
    }

    if (!form.description.trim()) {
      newErrors.description = "Mô tả không được để trống";
    }

    if (!form.price || form.price <= 0) {
      newErrors.price = "Giá phải lớn hơn 0";
    }

    if (!form.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Xử lý chọn file với validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      e.target.value = "";
      return;
    }

    // Kiểm tra kích thước (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      e.target.value = "";
      return;
    }

    // Revoke URL cũ trước khi tạo mới
    if (form.previewImage && form.previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(form.previewImage);
    }

    setForm({
      ...form,
      image: file,
      previewImage: URL.createObjectURL(file),
    });
  };

  // 📌 Cập nhật sản phẩm
 const handleUpdate = async () => {
  console.log("=== START UPDATE ===");
  console.log("Food ID:", form.id);
  console.log("Food ID type:", typeof form.id);
  console.log("Full URL:", `${API_URL}/api/food/${form.id}`);
  
  if (!form.id || form.id === "undefined") {
    toast.error("ID sản phẩm không hợp lệ");
    return;
  }

  if (!validateForm()) {
    toast.error("Vui lòng điền đầy đủ thông tin hợp lệ");
    return;
  }

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("price", parseFloat(form.price));
    formData.append("categoryId", form.categoryId);
    if (form.image) formData.append("image", form.image);

    console.log("📦 Sending PUT request to:", `${API_URL}/api/food/${form.id}`);

    const res = await axios.put(`${API_URL}/api/food/${form.id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Response:", res.data);

    if (res.data.success) {
      toast.success("✅ Cập nhật sản phẩm thành công!");
      refreshList?.();
      onClose?.();
    } else {
      toast.error(res.data.message || "Cập nhật thất bại");
    }
  } catch (err) {
    console.error("❌ Full Error:", err);
    console.error("❌ Error Response:", err.response);
    console.error("❌ Error Request:", err.request);
    console.error("❌ Error Config:", err.config);
    
    if (err.response?.status === 404) {
      toast.error(`Không tìm thấy route: PUT /api/food/${form.id}`);
    } else {
      const errorMsg = err.response?.data?.message || "Có lỗi khi cập nhật sản phẩm";
      toast.error(errorMsg);
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="edit-modal">
      <div className="edit-form">
        <h3>✏️ Sửa sản phẩm</h3>

        {/* Tên sản phẩm */}
        <div className="form-group">
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              setErrors({ ...errors, name: "" });
            }}
            placeholder="Tên sản phẩm"
            className={errors.name ? "input-error" : ""}
            disabled={loading}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        {/* Mô tả */}
        <div className="form-group">
          <textarea
            value={form.description}
            onChange={(e) => {
              setForm({ ...form, description: e.target.value });
              setErrors({ ...errors, description: "" });
            }}
            placeholder="Mô tả"
            className={errors.description ? "input-error" : ""}
            disabled={loading}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        {/* Giá */}
        <div className="form-group">
          <input
            type="number"
            value={form.price}
            onChange={(e) => {
              setForm({ ...form, price: e.target.value });
              setErrors({ ...errors, price: "" });
            }}
            placeholder="Giá"
            min="0"
            step="1000"
            className={errors.price ? "input-error" : ""}
            disabled={loading}
          />
          {errors.price && <span className="error-message">{errors.price}</span>}
        </div>

        {/* Upload ảnh */}
        <div className="form-group">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
          {form.previewImage && (
            <img
              src={form.previewImage}
              alt="preview"
              style={{ width: 100, marginTop: 10 }}
            />
          )}
        </div>

        {/* Select danh mục */}
        <div className="form-group">
          <select
            value={form.categoryId}
            onChange={(e) => {
              setForm({ ...form, categoryId: e.target.value });
              setErrors({ ...errors, categoryId: "" });
            }}
            className={errors.categoryId ? "input-error" : ""}
            disabled={loading}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: 20 }}>
          <button onClick={handleUpdate} disabled={loading}>
            {loading ? "⏳ Đang lưu..." : "💾 Lưu"}
          </button>
          <button onClick={onClose} style={{ marginLeft: 10 }} disabled={loading}>
            ❌ Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFood;