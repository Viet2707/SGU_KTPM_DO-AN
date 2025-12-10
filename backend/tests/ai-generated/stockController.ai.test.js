import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import app from "../../app.js"; // Adjust path as necessary
import Stock from "../../models/Stock.js"; // Adjust path as necessary
import Food from "../../models/Food.js"; // Adjust path as necessary
import Category from "../../models/Category.js"; // Adjust path as necessary
import path from "path";
import fs from "fs";

// Assuming a temporary directory for file uploads if needed for cleanup
const tempUploadDir = path.resolve(process.cwd(), "uploads", "test");

describe("Stock API Integration Tests", () => {
  let categoryId, foodId1, foodId2, stockId1;

  beforeEach(async () => {
    // Clean up database before each test
    await Stock.deleteMany({});
    await Food.deleteMany({});
    await Category.deleteMany({});

    // Create a temporary upload directory if it doesn't exist
    if (!fs.existsSync(tempUploadDir)) {
      fs.mkdirSync(tempUploadDir, { recursive: true });
    }

    // Create a dummy image file for upload tests
    // This fixes the 'Error: Aborted' from supertest when file is missing
    fs.writeFileSync(path.join(__dirname, "../temp-test-image.png"), "dummy content");


    // Create a dummy category
    const category = await Category.create({ name: "Cây Xanh" });
    categoryId = category._id;

    // Create dummy food items
    const food1 = await Food.create({
      name: "Cây A",
      description: "Mô tả A",
      price: 100,
      image: "image_a.jpg",
      categoryId: categoryId,
    });
    foodId1 = food1._id;

    const food2 = await Food.create({
      name: "Cây B",
      description: "Mô tả B",
      price: 150,
      image: "image_b.jpg",
      categoryId: categoryId,
    });
    foodId2 = food2._id;

    // Create dummy stock
    const stock1 = await Stock.create({ foodId: foodId1, quantity: 50 });
    stockId1 = stock1._id;
  });

  afterEach(async () => {
    // Clean up any test-created files if necessary.
    // For updateStock, if a file is uploaded, the controller will save it.
    // We should clean up any files that were created during tests.
    // This is a basic cleanup; a more robust solution might track created files.
    if (fs.existsSync(tempUploadDir)) {
      fs.readdirSync(tempUploadDir).forEach((file) => {
        fs.unlinkSync(path.join(tempUploadDir, file));
      });
    }

    // Clean up the dummy image file
    const dummyImage = path.join(__dirname, "../temp-test-image.png");
    if (fs.existsSync(dummyImage)) {
      fs.unlinkSync(dummyImage);
    }
  });

  // --- GET /api/stocks ---
  describe("GET /api/stocks (getAllStocks)", () => {
    it("should return an empty array if no stocks exist", async () => {
      // Arrange
      await Stock.deleteMany({}); // Ensure no stocks

      // Act
      const res = await request(app).get("/api/stocks");

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stocks).toBeInstanceOf(Array);
      expect(res.body.stocks).toHaveLength(0);
    });

    it("should return all stocks with populated food and category information", async () => {
      // Arrange - data already set up in beforeEach (stockId1 linked to foodId1)

      // Act
      const res = await request(app).get("/api/stocks");

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stocks).toBeInstanceOf(Array);
      expect(res.body.stocks).toHaveLength(1);

      const stock = res.body.stocks[0];
      expect(stock._id).toBe(stockId1.toString());
      expect(stock.quantity).toBe(50);
      expect(stock.foodInfo).toBeDefined();
      expect(stock.foodInfo.name).toBe("Cây A");
      expect(stock.foodInfo.price).toBe(100);
      expect(stock.categoryInfo).toBeDefined();
      expect(stock.categoryInfo.name).toBe("Cây Xanh");
    });

    it("should handle multiple stocks correctly", async () => {
      // Arrange
      await Stock.create({ foodId: foodId2, quantity: 25 }); // Add another stock

      // Act
      const res = await request(app).get("/api/stocks");

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stocks).toHaveLength(2);
      expect(res.body.stocks.some((s) => s.foodInfo.name === "Cây A")).toBe(
        true
      );
      expect(res.body.stocks.some((s) => s.foodInfo.name === "Cây B")).toBe(
        true
      );
    });
  });

  // --- POST /api/stocks ---
  describe("POST /api/stocks (createStock)", () => {
    it("should create a new stock if foodId does not exist in stock", async () => {
      // Arrange
      const newFood = await Food.create({
        name: "Cây C",
        description: "Mô tả C",
        price: 200,
        image: "image_c.jpg",
        categoryId: categoryId,
      });

      // Act
      const res = await request(app)
        .post("/api/stocks")
        .field("foodId", newFood._id.toString())
        .field("quantity", 10)
        .attach("image", path.join(__dirname, "../temp-test-image.png")); // Attach a dummy file for middleware

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã nhập kho");
      expect(res.body.stock).toBeDefined();
      expect(res.body.stock.foodId).toBe(newFood._id.toString());
      expect(res.body.stock.quantity).toBe(10);

      const stockInDb = await Stock.findOne({ foodId: newFood._id });
      expect(stockInDb).toBeDefined();
      expect(stockInDb.quantity).toBe(10);
    });

    it("should update quantity if stock for foodId already exists", async () => {
      // Arrange - stockId1 (foodId1, qty 50) exists
      const initialQuantity = 50;

      // Act
      const res = await request(app)
        .post("/api/stocks")
        .field("foodId", foodId1.toString())
        .field("quantity", 20)
        .attach("image", path.join(__dirname, "../temp-test-image.png")); // Attach a dummy file

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã nhập kho");
      expect(res.body.stock).toBeDefined();
      expect(res.body.stock.foodId).toBe(foodId1.toString());
      expect(res.body.stock.quantity).toBe(initialQuantity + 20); // 50 + 20 = 70

      const stockInDb = await Stock.findOne({ foodId: foodId1 });
      expect(stockInDb).toBeDefined();
      expect(stockInDb.quantity).toBe(initialQuantity + 20);
    });

    it("should default quantity to 0 if not provided when creating new stock", async () => {
      // Arrange
      const newFood = await Food.create({
        name: "Cây D",
        description: "Mô tả D",
        price: 250,
        image: "image_d.jpg",
        categoryId: categoryId,
      });

      // Act
      const res = await request(app)
        .post("/api/stocks")
        .field("foodId", newFood._id.toString())
        .attach("image", path.join(__dirname, "../temp-test-image.png")); // Attach a dummy file

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stock.quantity).toBe(0);

      const stockInDb = await Stock.findOne({ foodId: newFood._id });
      expect(stockInDb).toBeDefined();
      expect(stockInDb.quantity).toBe(0);
    });

    it("should default quantity to 0 if not provided when updating existing stock", async () => {
      // Arrange - stockId1 (foodId1, qty 50) exists
      const initialQuantity = 50;

      // Act
      const res = await request(app)
        .post("/api/stocks")
        .field("foodId", foodId1.toString())
        .attach("image", path.join(__dirname, "../temp-test-image.png")); // Attach a dummy file

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stock.quantity).toBe(initialQuantity); // 50 + 0 = 50

      const stockInDb = await Stock.findOne({ foodId: foodId1 });
      expect(stockInDb).toBeDefined();
      expect(stockInDb.quantity).toBe(initialQuantity);
    });

    it("should return 400 if foodId does not exist", async () => {
      // Arrange
      const invalidFoodId = "60c72b2f9c1b3c001c8e0e1a"; // A valid-looking but non-existent ID

      // Act
      const res = await request(app)
        .post("/api/stocks")
        .field("foodId", invalidFoodId)
        .field("quantity", 10)
        .attach("image", path.join(__dirname, "../temp-test-image.png")); // Attach a dummy file

      // Assert
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(
        "Food không tồn tại, hãy Thêm cây mới trước"
      );
    });

    it("should return 500 for a server error (e.g., malformed foodId)", async () => {
      // Arrange
      const malformedFoodId = "invalid_id";

      // Act
      const res = await request(app)
        .post("/api/stocks")
        .field("foodId", malformedFoodId)
        .field("quantity", 10)
        .attach("image", path.join(__dirname, "../temp-test-image.png")); // Attach a dummy file

      // Assert
      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });
  });

  // --- PUT /api/stocks/:foodId ---
  describe("PUT /api/stocks/:foodId (updateStock)", () => {
    it("should update food details without changing image", async () => {
      // Arrange - foodId1 exists
      const initialImage = "image_a.jpg";
      const updatePayload = {
        name: "Cây A Đã Sửa",
        description: "Mô tả A đã được cập nhật",
        price: 120,
      };

      // Act
      const res = await request(app)
        .put(`/api/stocks/${foodId1.toString()}`)
        .send(updatePayload);

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.food).toBeDefined();
      expect(res.body.food.name).toBe(updatePayload.name);
      expect(res.body.food.description).toBe(updatePayload.description);
      expect(res.body.food.price).toBe(updatePayload.price);
      expect(res.body.food.image).toBe(initialImage); // Image should remain unchanged

      const foodInDb = await Food.findById(foodId1);
      expect(foodInDb.name).toBe(updatePayload.name);
      expect(foodInDb.image).toBe(initialImage);
    });

    it("should update food details and change image when a new file is uploaded", async () => {
      // Arrange - foodId1 exists
      const newImageFileName = "test-upload.png";
      const newImagePath = path.join(tempUploadDir, newImageFileName);
      fs.writeFileSync(newImagePath, "dummy image content"); // Create a dummy file

      const updatePayload = {
        name: "Cây A - New Image",
        price: 130,
      };

      // Act
      const res = await request(app)
        .put(`/api/stocks/${foodId1.toString()}`)
        .field("name", updatePayload.name)
        .field("price", updatePayload.price)
        .attach("image", newImagePath);

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.food).toBeDefined();
      expect(res.body.food.name).toBe(updatePayload.name);
      expect(res.body.food.price).toBe(updatePayload.price);
      expect(res.body.food.image).toBeDefined();
      // The actual filename would be changed by the upload middleware,
      // so we check if it's different from the original and exists.
      expect(res.body.food.image).not.toBe("image_a.jpg");
      expect(res.body.food.image).toMatch(/\.png$/); // Check for the correct extension

      const foodInDb = await Food.findById(foodId1);
      expect(foodInDb.name).toBe(updatePayload.name);
      expect(foodInDb.image).toEqual(res.body.food.image);

      // Clean up the uploaded file to prevent accumulation
      fs.unlinkSync(path.join(process.cwd(), "uploads", res.body.food.image));
    });

    it("should update categoryId if new category is provided", async () => {
      // Arrange
      const newCategory = await Category.create({ name: "Cây Lớn" });
      const updatePayload = {
        categoryId: newCategory._id.toString(),
      };

      // Act
      const res = await request(app)
        .put(`/api/stocks/${foodId1.toString()}`)
        .send(updatePayload);

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.food).toBeDefined();
      expect(res.body.food.categoryId._id).toBe(newCategory._id.toString());
      expect(res.body.food.categoryId.name).toBe(newCategory.name);

      const foodInDb = await Food.findById(foodId1);
      expect(foodInDb.categoryId.toString()).toBe(newCategory._id.toString());
    });

    it("should return 404 if foodId does not exist", async () => {
      // Arrange
      const invalidFoodId = "60c72b2f9c1b3c001c8e0e1a"; // A valid-looking but non-existent ID
      const updatePayload = { name: "Non Existent Food" };

      // Act
      const res = await request(app)
        .put(`/api/stocks/${invalidFoodId}`)
        .send(updatePayload);

      // Assert
      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Food không tồn tại");
    });

    it("should return 500 for a server error (e.g., malformed foodId)", async () => {
      // Arrange
      const malformedFoodId = "invalid_id";
      const updatePayload = { name: "Malformed Food" };

      // Act
      const res = await request(app)
        .put(`/api/stocks/${malformedFoodId}`)
        .send(updatePayload);

      // Assert
      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });
  });

  // --- DELETE /api/stocks/:stockId ---
  describe("DELETE /api/stocks/:stockId (deleteStock)", () => {
    it("should delete stock and its associated food", async () => {
      // Arrange - stockId1 (foodId1, qty 50) exists
      const initialStockCount = await Stock.countDocuments();
      const initialFoodCount = await Food.countDocuments();

      // Act
      const res = await request(app).delete(`/api/stocks/${stockId1.toString()}`);

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã xoá Food + Stock");

      const stockInDb = await Stock.findById(stockId1);
      expect(stockInDb).toBeNull();

      const foodInDb = await Food.findById(foodId1);
      expect(foodInDb).toBeNull();

      const finalStockCount = await Stock.countDocuments();
      const finalFoodCount = await Food.countDocuments();
      expect(finalStockCount).toBe(initialStockCount - 1);
      expect(finalFoodCount).toBe(initialFoodCount - 1);
    });

    it("should return 404 if stockId does not exist", async () => {
      // Arrange
      const invalidStockId = "60c72b2f9c1b3c001c8e0e1a"; // A valid-looking but non-existent ID

      // Act
      const res = await request(app).delete(`/api/stocks/${invalidStockId}`);

      // Assert
      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Không tìm thấy stock");
    });

    it("should return 500 for a server error (e.g., malformed stockId)", async () => {
      // Arrange
      const malformedStockId = "invalid_id";

      // Act
      const res = await request(app).delete(`/api/stocks/${malformedStockId}`);

      // Assert
      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });
  });

  // --- POST /api/stocks/change ---
  describe("POST /api/stocks/change (changeQuantity)", () => {
    it("should increase stock quantity by a positive amount", async () => {
      // Arrange - stockId1 (foodId1, qty 50) exists
      const initialQuantity = 50;
      const qtyToAdd = 10;

      // Act
      const res = await request(app)
        .post("/api/stocks/change")
        .send({ foodId: foodId1.toString(), qty: qtyToAdd });

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stock).toBeDefined();
      expect(res.body.stock.quantity).toBe(initialQuantity + qtyToAdd);

      const stockInDb = await Stock.findOne({ foodId: foodId1 });
      expect(stockInDb.quantity).toBe(initialQuantity + qtyToAdd);
    });

    it("should decrease stock quantity by a negative amount", async () => {
      // Arrange - stockId1 (foodId1, qty 50) exists
      const initialQuantity = 50;
      const qtyToSubtract = -20; // Negative value to decrease

      // Act
      const res = await request(app)
        .post("/api/stocks/change")
        .send({ foodId: foodId1.toString(), qty: qtyToSubtract });

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stock).toBeDefined();
      expect(res.body.stock.quantity).toBe(initialQuantity + qtyToSubtract);

      const stockInDb = await Stock.findOne({ foodId: foodId1 });
      expect(stockInDb.quantity).toBe(initialQuantity + qtyToSubtract);
    });

    it("should clamp quantity to 0 if decrease results in negative", async () => {
      // Arrange - stockId1 (foodId1, qty 50) exists
      const initialQuantity = 50;
      const qtyToSubtract = -60; // Larger than current quantity

      // Act
      const res = await request(app)
        .post("/api/stocks/change")
        .send({ foodId: foodId1.toString(), qty: qtyToSubtract });

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stock).toBeDefined();
      expect(res.body.stock.quantity).toBe(0); // Should be clamped to 0

      const stockInDb = await Stock.findOne({ foodId: foodId1 });
      expect(stockInDb.quantity).toBe(0);
    });

    it("should not change quantity if qty is 0 or not provided", async () => {
      // Arrange - stockId1 (foodId1, qty 50) exists
      const initialQuantity = 50;

      // Act 1: qty = 0
      const res1 = await request(app)
        .post("/api/stocks/change")
        .send({ foodId: foodId1.toString(), qty: 0 });

      // Assert 1
      expect(res1.statusCode).toEqual(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.stock.quantity).toBe(initialQuantity);

      // Act 2: qty missing
      const res2 = await request(app)
        .post("/api/stocks/change")
        .send({ foodId: foodId1.toString() });

      // Assert 2
      expect(res2.statusCode).toEqual(200);
      expect(res2.body.success).toBe(true);
      expect(res2.body.stock.quantity).toBe(initialQuantity); // No change

      const stockInDb = await Stock.findOne({ foodId: foodId1 });
      expect(stockInDb.quantity).toBe(initialQuantity);
    });

    it("should return 404 if stock for foodId does not exist", async () => {
      // Arrange
      const invalidFoodId = "60c72b2f9c1b3c001c8e0e1a"; // A valid-looking but non-existent ID
      const qtyToChange = 5;

      // Act
      const res = await request(app)
        .post("/api/stocks/change")
        .send({ foodId: invalidFoodId, qty: qtyToChange });

      // Assert
      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Không tìm thấy stock");
    });

    it("should return 500 for a server error (e.g., malformed foodId)", async () => {
      // Arrange
      const malformedFoodId = "invalid_id";
      const qtyToChange = 5;

      // Act
      const res = await request(app)
        .post("/api/stocks/change")
        .send({ foodId: malformedFoodId, qty: qtyToChange });

      // Assert
      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });
  });
});