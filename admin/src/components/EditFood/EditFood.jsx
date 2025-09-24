import React, { useState } from "react";
import "./EditFood.css";
import axios from "axios";
import { url } from "../../assets/assets";

const EditFood = ({ food, onClose, refreshList }) => {
    const [formData, setFormData] = useState({
        name: food.name,
        description: food.description,
        price: food.price,
        category: food.category,
    });
    const [image, setImage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("id", food._id);
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("category", formData.category);
        if (image) data.append("image", image);

        try {
            const res = await axios.put(`${url}/api/food/update`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) {
                refreshList();
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="edit-food">
            <h2>Edit Food</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
                <input name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
                <input name="price" value={formData.price} onChange={handleChange} placeholder="Price" type="number" />
                <select name="category" value={formData.category} onChange={handleChange}>
                      <option value="Cây dễ chăm">Cây dễ chăm</option>
                            <option value="Cây văn phòng">Cây văn phòng</option>
                            <option value="Cây phong thủy">Cây phong thủy</option>
                            <option value="Cây để bàn">Cây để bàn</option>
                            <option value="Cây trồng nước">Cây trồng nước</option>
                            <option value="Cây cao cấp">Cây cao cấp</option>
                            <option value="Trậu nung đất">Trậu nung đất</option>
                            <option value="Chậu xi măng">Chậu xi măng</option>
                </select>
                <input type="file" onChange={handleImageChange} />
                <button type="submit">Save</button>
                <button type="button" onClick={onClose}>Cancel</button>
            </form>
        </div>
    );
};

export default EditFood;
