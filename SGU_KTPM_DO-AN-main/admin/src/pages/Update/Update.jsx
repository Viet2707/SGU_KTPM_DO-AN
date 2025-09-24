/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Update.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Update = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({
    name: '',
    category: '',
    price: '',
    image: null,
  });

  useEffect(() => {
    // Fetch dữ liệu sản phẩm để điền vào form
    const fetchItem = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/food/${id}`); // Giả sử endpoint lấy chi tiết
        if (response.data.success) {
          setItemData({
            name: response.data.data.name,
            category: response.data.data.category,
            price: response.data.data.price,
            image: null,
          });
        } else {
          toast.error("Error fetching item");
        }
      } catch (error) {
        toast.error("Network error");
        console.error('Fetch item error:', error);
      }
    };
    fetchItem();
  }, [id]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setItemData((prev) => ({ ...prev, [name]: value }));
  };

  const onImageChange = (event) => {
    setItemData((prev) => ({ ...prev, image: event.target.files[0] }));
  };

  const updateFood = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', itemData.name);
    formData.append('category', itemData.category);
    formData.append('price', Number(itemData.price));
    if (itemData.image) formData.append('image', itemData.image);

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/food/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/list'); // Trở về trang List sau khi cập nhật
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Error updating food');
    }
  };

  return (
    <div className='update-container'>
      <h2>Update Food</h2>
      <form className="update-form" onSubmit={updateFood}>
        <input
          type="text"
          name="name"
          value={itemData.name}
          onChange={onChangeHandler}
          placeholder="Name"
          required
        />
        <select
          name="category"
          value={itemData.category}
          onChange={onChangeHandler}
          required
        >
            <option value="Cây dễ chăm">Cây dễ chăm</option>
                            <option value="Cây văn phòng">Cây văn phòng</option>
                            <option value="Cây phong thủy">Cây phong thủy</option>
                            <option value="Cây để bàn">Cây để bàn</option>
                            <option value="Cây trồng nước">Cây trồng nước</option>
                            <option value="Cây cao cấp">Cây cao cấp</option>
                            <option value="Chậu nung đất">Trậu nung đất</option>
                            <option value="Chậu xi măng">Chậu xi măng</option>
        </select>
        <input
          type="number"
          name="price"
          value={itemData.price}
          onChange={onChangeHandler}
          placeholder="Price"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
        />
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate('/list')}>Cancel</button>
      </form>
    </div>
  );
};

export default Update;