import React, { useEffect, useState } from "react";
import "./List.css";
import { currency, url } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import EditFood from "../../components/EditFood/EditFood";

const List = () => {
  const [list, setList] = useState([]);
  const [editingFood, setEditingFood] = useState(null);

  // 📌 Lấy danh sách sản phẩm + sắp xếp theo số lượng giảm dần
  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        const foods = response.data.data;

        // 👉 Sắp xếp theo số lượng giảm dần
        foods.sort((a, b) => b.quantity - a.quantity);

        setList(foods);
      } else {
        toast.error("Lấy danh sách sản phẩm thất bại");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi lấy danh sách sản phẩm");
    }
  };

  // 📌 Xoá sản phẩm
  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error("Xóa sản phẩm thất bại");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi xóa sản phẩm");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list add flex-col">
      <p>Danh sách sản phẩm</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Quantity</b>   {/* ✅ Thêm cột số lượng */}
          <b>Action</b>
        </div>

        {list.map((item, index) => (
          <div key={index} className="list-table-format">
            <img src={`${url}/images/${item.image}`} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{currency}{item.price}</p>
            <p>{item.quantity}</p>   {/* ✅ hiển thị số lượng */}
            <div className="action-buttons">
              <span className="cursor edit" onClick={() => setEditingFood(item)}>Edit</span>
              <span className="cursor remove" onClick={() => removeFood(item._id)}>x</span>
            </div>
          </div>
        ))}
      </div>

      {editingFood && (
        <EditFood
          food={editingFood}
          onClose={() => setEditingFood(null)}
          refreshList={fetchList}
        />
      )}
    </div>
  );
};

export default List;