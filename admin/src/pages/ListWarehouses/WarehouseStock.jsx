import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const url = "http://localhost:4000/api/warehouse";

export default function WarehouseStock({ warehouse }) {
    const [stocks, setStocks] = useState([]);

    const fetchStock = async () => {
        try {
            const res = await axios.get(`${url}/${warehouse._id}/stocks`);
            if (res.data.success) setStocks(res.data.stocks);
        } catch (error) {
            toast.error("Không thể tải tồn kho");
        }
    };

    const handleUpdateStock = async (productId, qty) => {
        try {
            const res = await axios.post(`${url}/update-stock`, { warehouseId: warehouse._id, productId, quantity: qty });
            if (res.data.success) fetchStock();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi cập nhật tồn kho");
        }
    };

    useEffect(() => {
        fetchStock();
    }, [warehouse]);

    return (
        <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
            <h2>{warehouse.name} - Menu: {warehouse.category}</h2>
            {stocks.length === 0 ? (
                <p>Không có sản phẩm trong kho</p>
            ) : (
                <ul>
                    {stocks.map((s) => (
                        <li key={s._id}>
                            {s.productId?.name} - {s.quantity}
                            <button onClick={() => handleUpdateStock(s.productId._id, 1)}>+</button>
                            <button onClick={() => handleUpdateStock(s.productId._id, -1)}>-</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
