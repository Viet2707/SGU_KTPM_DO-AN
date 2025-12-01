/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import './Add.css';
import { assets, url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = () => {
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]); // danh mục từ backend, mặc định là mảng rỗng
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: ""   // sẽ lưu ObjectId từ backend
  });

  // 📌 Lấy Category khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${url}/api/category/list`); // ✅ gọi /list
        if (res.data.success) {
          setCategories(res.data.categories); // backend trả { categories: [...] }
        } else {
          toast.error("Không lấy được danh mục");
        }
      } catch (err) {
        console.error("❌ Lỗi lấy categories:", err);
        toast.error("Lỗi khi load danh mục");
      }
    };
    fetchCategories();
  }, []);

  // 📌 Submit tạo Food
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error('Chưa chọn ảnh');
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", Number(data.price));
      formData.append("categoryId", data.categoryId); // gửi _id Category
      formData.append("image", image);

      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setData({ name: "", description: "", price: "", categoryId: "" });
        setImage(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("❌ Add error:", err);
      toast.error("Thêm sản phẩm thất bại");
    }
  };

  // 📌 Handle change input
  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler} role="form">
        
        {/* Upload ảnh */}
        <div className='add-img-upload flex-col'>
          <label htmlFor="image">
            <p>Upload image</p>
            <input
              onChange={(e) => { setImage(e.target.files[0]); e.target.value = ''; }}
              type="file"
              accept="image/*"
              id="image"
              hidden
            />
            <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="preview" />
          </label>
        </div>

        {/* Tên sản phẩm */}
        <div className='add-product-name flex-col'>
          <p>Product name</p>
          <input 
            name='name' 
            value={data.name} 
            onChange={onChangeHandler} 
            type="text" 
            placeholder='Nhập tên sản phẩm' 
            required 
          />
        </div>

        {/* Mô tả */}
        <div className='add-product-description flex-col'>
          <p>Product description</p>
          <textarea 
            name='description' 
            value={data.description} 
            onChange={onChangeHandler} 
            rows={6} 
            placeholder='Nhập mô tả sản phẩm' 
            required 
          />
        </div>

        {/* Category + Price */}
        <div className='add-category-price'>
          <div className='add-category flex-col'>
            <p>Product category</p>
            <select 
              name='categoryId' 
              value={data.categoryId} 
              onChange={onChangeHandler} 
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className='add-price flex-col'>
            <p>Product Price</p>
            <input 
              type='number' 
              name='price' 
              value={data.price} 
              onChange={onChangeHandler} 
              placeholder='Nhập giá (VND)' 
              required 
            />
          </div>
        </div>

        <button type='submit' className='add-btn'>ADD</button>
      </form>
    </div>
  );
};

export default Add;