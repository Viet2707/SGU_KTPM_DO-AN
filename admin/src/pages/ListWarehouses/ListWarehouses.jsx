import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateWarehouse from "./CreateWarehouse";
import WarehouseStock from "./WarehouseStock";

const url = "http://localhost:4000/api/warehouse";

export default function ListWarehouses() {
    const [warehouses, setWarehouses] = useState([]);

    const fetchWarehouses = async () => {
        const res = await axios.get(`${url}/list`);
        if (res.data.success) setWarehouses(res.data.warehouses);
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1>Danh sách kho hàng</h1>
            <CreateWarehouse onCreated={fetchWarehouses} />

            {warehouses.map((w) => (
                <WarehouseStock key={w._id} warehouse={w} />
            ))}
        </div>
    );
}
