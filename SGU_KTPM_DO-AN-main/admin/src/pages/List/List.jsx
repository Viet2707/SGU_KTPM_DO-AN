/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import './List.css';
import { currency, url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const List = () => {
  const [list, setList] = useState([]);
  const navigate = useNavigate(); // Hook để điều hướng

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error");
      }
    } catch (error) {
      toast.error("Network error");
      console.error('Fetch error:', error);
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      await fetchList();
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error("Error");
      }
    } catch (error) {
      toast.error("Network error");
      console.error('Remove error:', error);
    }
  };

  // Chuyển đến trang cập nhật khi nhấn Edit
  const handleEdit = (itemId) => {
    navigate(`/update/${itemId}`); // Chuyển đến trang Update với ID
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className='list-table'>
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => (
          <div key={index} className='list-table-format'>
            <img src={`${url}/images/${item.image}`} alt="" />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{currency}{item.price}</p>
            <div className="flex">
              <button className="edit-btn cursor" onClick={() => handleEdit(item._id)}>Edit</button>
              <button className="remove-btn cursor" onClick={() => removeFood(item._id)}>x</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;