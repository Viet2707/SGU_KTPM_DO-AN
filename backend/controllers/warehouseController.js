import Warehouse from "../models/Warehouse.js";
import Food from "../models/Food.js";
import Stock from "../models/Stock.js";

// Lấy danh sách kho
export const listWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({}).lean();
    console.log("Warehouses found:", warehouses);
    res.json({ success: true, warehouses });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách kho", error: error.message });
  }
};

// Tạo kho mới
export const createWarehouse = async (req, res) => {
    try {
        const { name, location, category } = req.body;
        
        if (!name || !location || !category) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập đầy đủ thông tin" 
            });
        }

        const warehouse = new Warehouse({ name, location, category });
        await warehouse.save();

        res.json({ success: true, warehouse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xem tồn kho của kho
export const viewStock = async (req, res) => {
    try {
        const { warehouseId } = req.params;

        if (!warehouseId) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu warehouseId" 
            });
        }

        const stocks = await Stock.find({ warehouseId }).populate("foodId");

        res.json({ success: true, stocks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật tồn kho
export const updateStock = async (req, res) => {
    try {
        const { warehouseId, foodId, quantity } = req.body;

        if (!warehouseId || !foodId || quantity === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin warehouseId, foodId hoặc quantity" 
            });
        }

        const stock = await Stock.findOne({ warehouseId, foodId });
        
        if (!stock) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy sản phẩm trong kho" 
            });
        }

        stock.quantity += quantity;
        if (stock.quantity < 0) stock.quantity = 0;
        
        // Update status based on quantity
        if (stock.quantity === 0) stock.status = "out of stock";
        else if (stock.quantity < 10) stock.status = "low stock";
        else stock.status = "available";
        
        stock.lastUpdated = new Date();
        await stock.save();

        // Populate the updated stock
        const updatedStock = await Stock.findById(stock._id).populate("foodId");

        res.json({ success: true, stock: updatedStock });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Thêm sản phẩm mới vào kho
export const addStock = async (req, res) => {
    try {
        const { warehouseId, foodId, quantity } = req.body;

        if (!warehouseId || !foodId || quantity === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin warehouseId, foodId hoặc quantity" 
            });
        }

        const existingStock = await Stock.findOne({ warehouseId, foodId });
        if (existingStock) {
            return res.status(400).json({ 
                success: false, 
                message: "Sản phẩm đã tồn tại trong kho. Sử dụng cập nhật thay vì thêm mới." 
            });
        }

        const stock = new Stock({ 
            warehouseId, 
            foodId, 
            quantity,
            status: quantity === 0 ? "out of stock" : quantity < 10 ? "low stock" : "available"
        });
        
        await stock.save();

        // Populate the new stock
        const newStock = await Stock.findById(stock._id).populate("foodId");

        res.json({ success: true, stock: newStock });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get foods by category (từ code của bạn)
export const getFoodsByCategory = async (req, res) => {
    try {
        const foods = await Food.find().lean();

        const categories = {};

        foods.forEach((food) => {
            const categoryName = food.category || "Không rõ danh mục";
            if (!categories[categoryName]) {
                categories[categoryName] = [];
            }
            categories[categoryName].push({
                _id: food._id,
                name: food.name || "Không có tên",
                description: food.description || "Không có mô tả",
                price: food.price || 0,
                image: food.image || null,
                category: categoryName,
            });
        });

        const result = Object.keys(categories).map((categoryName) => ({
            category: categoryName,
            foods: categories[categoryName],
        }));

        res.json({ success: true, categories: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu kho hàng",
        });
    }
};

// Get warehouse stock with foods organized by category
export const getWarehouseByCategory = async (req, res) => {
    try {
        const { warehouseId } = req.params;

        if (!warehouseId) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu warehouseId" 
            });
        }

        // Get all stocks for this warehouse
        const stocks = await Stock.find({ warehouseId }).populate("foodId");

        // Group by category
        const categories = {};

        stocks.forEach((stock) => {
            const food = stock.foodId;
            if (!food) return;

            const categoryName = food.category || "Không rõ danh mục";
            if (!categories[categoryName]) {
                categories[categoryName] = [];
            }
            
            categories[categoryName].push({
                _id: food._id,
                name: food.name,
                description: food.description,
                price: food.price,
                image: food.image,
                category: categoryName,
                stock: {
                    quantity: stock.quantity,
                    status: stock.status,
                    lastUpdated: stock.lastUpdated
                }
            });
        });

        const result = Object.keys(categories).map((categoryName) => ({
            category: categoryName,
            foods: categories[categoryName],
        }));

        res.json({ success: true, categories: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu kho hàng theo danh mục",
        });
    }
};