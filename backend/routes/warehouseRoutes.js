import express from "express";
import { 
    listWarehouses, 
    createWarehouse,
    viewStock, 
    updateStock,
    addStock,
    getFoodsByCategory,
    getWarehouseByCategory
} from "../controllers/warehouseController.js";

const router = express.Router();

// Lấy danh sách kho
router.get("/", listWarehouses);

// Tạo kho mới
router.post("/", createWarehouse);

// Xem tồn kho của một kho
router.get("/:warehouseId/stocks", viewStock);

// Xem tồn kho của một kho theo danh mục
router.get("/:warehouseId/categories", getWarehouseByCategory);

// Cập nhật tồn kho
router.post("/update-stock", updateStock);

// Thêm sản phẩm mới vào kho
router.post("/add-stock", addStock);

// Lấy tất cả foods theo category
router.get("/categories", getFoodsByCategory);

// Test route để debug
router.get("/debug/test", async (req, res) => {
    try {
        const Warehouse = (await import("../models/Warehouse.js")).default;
        const Food = (await import("../models/Food.js")).default;
        const Stock = (await import("../models/Stock.js")).default;
        
        const warehouseCount = await Warehouse.countDocuments();
        const foodCount = await Food.countDocuments();
        const stockCount = await Stock.countDocuments();
        
        const sampleWarehouse = await Warehouse.findOne().lean();
        const sampleFood = await Food.findOne().lean();
        const sampleStock = await Stock.findOne()
            .populate('foodId')
            .populate('warehouseId')
            .lean();
        
        res.json({
            success: true,
            counts: {
                warehouses: warehouseCount,
                foods: foodCount,
                stocks: stockCount
            },
            samples: {
                warehouse: sampleWarehouse,
                food: sampleFood,
                stock: sampleStock
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Quick setup với dữ liệu food của bạn
router.post("/debug/quick-setup", async (req, res) => {
    try {
        const Warehouse = (await import("../models/Warehouse.js")).default;
        const Food = (await import("../models/Food.js")).default;
        const Stock = (await import("../models/Stock.js")).default;
        
        // Xóa dữ liệu cũ
        await Warehouse.deleteMany({});
        await Food.deleteMany({});
        await Stock.deleteMany({});
        
        // Tạo warehouses
        const warehouses = await Warehouse.insertMany([
            {
                name: "Kho của anh Đạt",
                location: "Hà Nội",
                category: "Cây dễ chăm"
            },
            {
                name: "Kho của anh Đạt", 
                location: "Hà Nội",
                category: "Cây văn phòng"
            }
        ]);
        
        // Tạo foods với dữ liệu của bạn
        const foods = await Food.insertMany([
            {
                name: "Hoa Hồng",
                description: "Hoa hồng đỏ tươi",
                price: 20000,
                category: "Cây cao cấp",
                image: "food_11.png"
            },
            {
                name: "Hoa Cúc",
                description: "Hoa cúc vàng nở đẹp",
                price: 15000,
                category: "Cây cao cấp",
                image: "food_12.png"
            },
            {
                name: "Hoa Lan",
                description: "Hoa lan tím sang trọng",
                price: 100000,
                category: "Cây cao cấp",
                image: "food_13.png"
            },
            {
                name: "Cây Xương Rồng",
                description: "Xương rồng mini để bàn",
                price: 50000,
                category: "Cây cao cấp",
                image: "food_14.png"
            },
            {
                name: "Cây Lưỡi Hổ",
                description: "Cây lưỡi hổ lọc không khí",
                price: 120000,
                category: "Cây cao cấp",
                image: "food_15.png"
            }
        ]);
        
        // Tạo stocks theo dữ liệu JSON của bạn
        const stocks = await Stock.insertMany([
            {
                foodId: foods[0]._id, // Hoa Hồng
                warehouseId: warehouses[0]._id, // wh001
                quantity: 100,
                status: "available"
            },
            {
                foodId: foods[1]._id, // Hoa Cúc
                warehouseId: warehouses[0]._id, // wh001
                quantity: 50,
                status: "low stock"
            },
            {
                foodId: foods[2]._id, // Hoa Lan
                warehouseId: warehouses[1]._id, // wh002
                quantity: 200,
                status: "available"
            },
            {
                foodId: foods[3]._id, // Cây Xương Rồng
                warehouseId: warehouses[1]._id, // wh002
                quantity: 0,
                status: "out of stock"
            },
            {
                foodId: foods[4]._id, // Cây Lưỡi Hổ
                warehouseId: warehouses[1]._id, // wh002
                quantity: 30,
                status: "low stock"
            }
        ]);
        
        res.json({
            success: true,
            message: "Food data created successfully!",
            created: {
                warehouses: warehouses.length,
                foods: foods.length,
                stocks: stocks.length
            },
            warehouseIds: warehouses.map(w => ({ name: w.name, id: w._id })),
            foodIds: foods.map(f => ({ name: f.name, id: f._id }))
        });
        
    } catch (error) {
        console.error("Quick setup error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;