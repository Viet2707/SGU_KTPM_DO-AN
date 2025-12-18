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
    <div className="edit-modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)'
    }}>
      <div className="edit-form" style={{
        background: '#ffffff',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25)',
        maxWidth: '550px',
        width: '95%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '3px solid #e3f2fd'
      }}>
        <h3 style={{
          margin: '0 0 30px 0',
          fontSize: '28px',
          fontWeight: '800',
          color: '#1565c0',
          textAlign: 'center',
          borderBottom: '3px solid #2196f3',
          paddingBottom: '15px'
        }}>✏️ Sửa sản phẩm</h3>

        {/* Tên sản phẩm */}
        <div className="form-group" style={{ marginBottom: '25px' }}>
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
            style={{
              width: '100%',
              padding: '15px 20px',
              fontSize: '16px',
              border: '2px solid #bbdefb',
              borderRadius: '12px',
              background: '#f3f8ff',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
              fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
            }}
          />
          {errors.name && <span className="error-message" style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            display: 'block',
            fontWeight: '500'
          }}>{errors.name}</span>}
        </div>

        {/* Mô tả */}
        <div className="form-group" style={{ marginBottom: '25px' }}>
          <textarea
            value={form.description}
            onChange={(e) => {
              setForm({ ...form, description: e.target.value });
              setErrors({ ...errors, description: "" });
            }}
            placeholder="Mô tả"
            className={errors.description ? "input-error" : ""}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px 20px',
              fontSize: '16px',
              border: '2px solid #bbdefb',
              borderRadius: '12px',
              background: '#f3f8ff',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
              fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
          {errors.description && <span className="error-message" style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            display: 'block',
            fontWeight: '500'
          }}>{errors.description}</span>}
        </div>

        {/* Giá */}
        <div className="form-group" style={{ marginBottom: '25px' }}>
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
            style={{
              width: '100%',
              padding: '15px 20px',
              fontSize: '16px',
              border: '2px solid #bbdefb',
              borderRadius: '12px',
              background: '#f3f8ff',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
              fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
            }}
          />
          {errors.price && <span className="error-message" style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            display: 'block',
            fontWeight: '500'
          }}>{errors.price}</span>}
        </div>

        {/* Upload ảnh */}
        <div className="form-group" style={{ marginBottom: '25px' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px 20px',
              fontSize: '16px',
              border: '2px dashed #bbdefb',
              borderRadius: '12px',
              background: '#f3f8ff',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          />
          {form.previewImage && (
            <img
              src={form.previewImage}
              alt="preview"
              style={{ 
                width: 120, 
                marginTop: 15, 
                borderRadius: '8px',
                border: '2px solid #e9ecef',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
          )}
        </div>

        {/* Select danh mục */}
        <div className="form-group" style={{ marginBottom: '25px' }}>
          <select
            value={form.categoryId}
            onChange={(e) => {
              setForm({ ...form, categoryId: e.target.value });
              setErrors({ ...errors, categoryId: "" });
            }}
            className={errors.categoryId ? "input-error" : ""}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px 20px',
              fontSize: '16px',
              border: '2px solid #bbdefb',
              borderRadius: '12px',
              background: '#f3f8ff',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
              fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
            }}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className="error-message" style={{
            color: '#dc3545',
            fontSize: '13px',
            marginTop: '4px',
            display: 'block',
            fontWeight: '500'
          }}>{errors.categoryId}</span>}
        </div>

        {/* Action buttons */}
        <div style={{ 
          marginTop: 32, 
          paddingTop: 20, 
          borderTop: '1px solid #e9ecef',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button 
            onClick={handleUpdate} 
            disabled={loading}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px',
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              color: 'white',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            {loading ? "⏳ Đang lưu..." : "💾 Lưu"}
          </button>
          <button 
            onClick={onClose} 
            disabled={loading}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px',
              background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
              color: 'white',
              boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            ❌ Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFood;