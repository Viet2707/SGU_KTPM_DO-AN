import Warehouse from "../models/Warehouse.js";
import Stock from "../models/Stock.js";
import Product from "../models/Product.js";

// Tạo kho mới
export const createWarehouse = async (req, res) => {
    try {
        const { name, location, category } = req.body;
        if (!name || !location || !category) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
        }
        const warehouse = new Warehouse({ name, location, category });
        await warehouse.save();

        // Lấy tất cả sản phẩm thuộc category để tạo stock ban đầu
        const products = await Product.find({ category });
        for (let p of products) {
            const stock = new Stock({
                warehouseId: warehouse._id,
                productId: p._id,
                quantity: 0
            });
            await stock.save();
        }

        res.json({ success: true, warehouse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy danh sách kho
export const listWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find();
        res.json({ success: true, warehouses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xem tồn kho của một kho
export const viewStock = async (req, res) => {
    try {
        const { warehouseId } = req.params;
        const stocks = await Stock.find({ warehouseId }).populate("productId");
        res.json({ success: true, stocks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật tồn kho
export const updateStock = async (req, res) => {
    try {
        const { warehouseId, productId, quantity } = req.body;
        let stock = await Stock.findOne({ warehouseId, productId });
        if (!stock) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

        stock.quantity += quantity;
        if (stock.quantity < 0) return res.status(400).json({ success: false, message: "Không đủ hàng trong kho" });

        await stock.save();
        res.json({ success: true, stock });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
    // Thêm stock mới cho 1 sản phẩm trong kho
    export const addStock = async (req, res) => {
    try {
        const { warehouseId, productId, quantity } = req.body;
        if (!warehouseId || !productId || quantity == null) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin" });
        }

        let stock = await Stock.findOne({ warehouseId, productId });
        if (stock) {
            return res.status(400).json({ success: false, message: "Stock đã tồn tại, vui lòng dùng updateStock" });
        }

        stock = new Stock({ warehouseId, productId, quantity });
        await stock.save();

        res.json({ success: true, stock });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
