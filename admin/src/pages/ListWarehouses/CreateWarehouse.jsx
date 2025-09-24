import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const url = "http://localhost:4000/api/warehouse";

export default function CreateWarehouse({ onCreated }) {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");

    const handleCreate = async () => {
        if (!name || !location) {
            toast.error("Vui lòng nhập đầy đủ tên và vị trí kho");
            return;
        }
        try {
            const res = await axios.post(`${url}/create`, { name, location });
            if (res.data.success) {
                toast.success("Tạo kho thành công");
                setName("");
                setLocation("");
                if (onCreated) onCreated(); // gọi reload danh sách kho
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi tạo kho");
        }
    };

    return (
        <div style={{ padding: "20px", border: "1px solid #ccc", marginBottom: "20px" }}>
            <h2>Tạo kho hàng mới</h2>
            <input
                placeholder="Tên kho"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginRight: "10px", padding: "5px" }}
            />
            <input
                placeholder="Vị trí kho"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ marginRight: "10px", padding: "5px" }}
            />
            <button onClick={handleCreate}>Tạo kho</button>
        </div>
    );
}
