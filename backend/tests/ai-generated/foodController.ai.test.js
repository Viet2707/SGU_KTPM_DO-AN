import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../../app.js"; // IMPORTANTE: Use ../../app.js
import Food from "../../models/Food.js"; // IMPORTANTE: Use ../../models/Food.js
import Stock from "../../models/Stock.js"; // IMPORTANTE: Use ../../models/Stock.js
import Category from "../../models/Category.js"; // Need Category for categoryId

// Mock the 'fs' module for file operations
vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    unlink: vi.fn((path, callback) => callback(null)), // Mock successful unlink by default
  };
});
import fs from "fs"; // Import the mocked fs

// Helper function to create a dummy category for tests
const createTestCategory = async () => {
  const category = await Category.create({ name: "Test Category", image: "cat-image.png" });
  return category._id;
};

// Helper function to create a dummy food for tests
const createTestFood = async (categoryId, nameSuffix = '') => {
  const food = await Food.create({
    name: `Test Food ${nameSuffix}`,
    description: "Delicious test food",
    price: 10,
    categoryId: categoryId,
    image: `food-image-${nameSuffix}.png`,
  });
  await Stock.create({ foodId: food._id, quantity: 5 });
  return food;
};

// Helper to mock req.file for Supertest's .attach()
const mockReqFile = (filename = "test-image.png") => ({
  fieldname: "image",
  originalname: filename,
  encoding: "7bit",
  mimetype: "image/png",
  destination: "uploads/",
  filename: filename,
  path: `uploads/${filename}`,
  size: 12345,
});

describe("Food Controller API Tests", () => {
  let testCategoryId;
  let testFoodId;

  beforeEach(async () => {
    // Clean up databases
    await Food.deleteMany({});
    await Stock.deleteMany({});
    await Category.deleteMany({});
    vi.clearAllMocks(); // Clear fs.unlink mock calls

    // Create a category needed for food operations
    testCategoryId = await createTestCategory();
  });

  // NOTE: Assuming routes are /api/food based on requirements,
  // and no authentication middleware is applied globally or to these specific routes
  // in app.js. If auth is present, you would need to obtain a token and
  // add .set('Authorization', `Bearer ${token}`) to requests.

  describe("GET /api/food - listFood", () => {
    it("should return an empty array if no foods exist", async () => {
      const res = await request(app).get("/api/food");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it("should return a list of foods with category name and stock quantity", async () => {
      // Arrange
      const food1 = await createTestFood(testCategoryId, '1');
      const food2 = await createTestFood(testCategoryId, '2');
      // Create a food without stock to test quantity 0
      const food3 = await Food.create({
        name: "Test Food 3",
        description: "Another test food",
        price: 12,
        categoryId: testCategoryId,
        image: "food-image-3.png",
      });
      // No stock for food3

      // Act
      const res = await request(app).get("/api/food");

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);

      const categoryName = (await Category.findById(testCategoryId)).name;

      // Verify food1 data
      const food1Data = res.body.data.find(f => f._id === food1._id.toString());
      expect(food1Data).toBeDefined();
      expect(food1Data.name).toBe(food1.name);
      expect(food1Data.description).toBe(food1.description);
      expect(food1Data.price).toBe(food1.price);
      expect(food1Data.image).toBe(food1.image);
      expect(food1Data.category).toBe(categoryName);
      expect(food1Data.quantity).toBe(5);

      // Verify food2 data
      const food2Data = res.body.data.find(f => f._id === food2._id.toString());
      expect(food2Data).toBeDefined();
      expect(food2Data.name).toBe(food2.name);
      expect(food2Data.description).toBe(food2.description);
      expect(food2Data.price).toBe(food2.price);
      expect(food2Data.image).toBe(food2.image);
      expect(food2Data.category).toBe(categoryName);
      expect(food2Data.quantity).toBe(5);

      // Verify food3 data (no stock, quantity should be 0)
      const food3Data = res.body.data.find(f => f._id === food3._id.toString());
      expect(food3Data).toBeDefined();
      expect(food3Data.name).toBe(food3.name);
      expect(food3Data.description).toBe(food3.description);
      expect(food3Data.price).toBe(food3.price);
      expect(food3Data.image).toBe(food3.image);
      expect(food3Data.category).toBe(categoryName);
      expect(food3Data.quantity).toBe(0);
    });

    it("should return 500 if an internal server error occurs", async () => {
      // Arrange: Mock Food.find to throw an error
      vi.spyOn(Food, "find").mockImplementationOnce(() => {
        throw new Error("Simulated DB error");
      });

      // Act
      const res = await request(app).get("/api/food");

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Error");
    });
  });

  describe("POST /api/food - addFood", () => {
    it("should successfully add a new food with an image", async () => {
      // Arrange
      const newFoodData = {
        name: "New Test Food",
        description: "A very tasty new food",
        price: 15,
        categoryId: testCategoryId.toString(),
      };
      const filename = mockReqFile().filename;

      // Act
      const res = await request(app)
        .post("/api/food")
        .field("name", newFoodData.name)
        .field("description", newFoodData.description)
        .field("price", newFoodData.price)
        .field("categoryId", newFoodData.categoryId)
        .attach("image", Buffer.from("dummy image content"), filename);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã thêm sản phẩm mới");
      expect(res.body.food).toBeDefined();
      expect(res.body.food.name).toBe(newFoodData.name);
      expect(res.body.food.description).toBe(newFoodData.description);
      expect(res.body.food.price).toBe(newFoodData.price);
      expect(res.body.food.categoryId).toBe(newFoodData.categoryId);
      expect(res.body.food.image).toBe(filename);

      const createdFood = await Food.findById(res.body.food._id);
      expect(createdFood).toBeDefined();
      expect(createdFood.name).toBe(newFoodData.name);

      const createdStock = await Stock.findOne({ foodId: createdFood._id });
      expect(createdStock).toBeDefined();
      expect(createdStock.quantity).toBe(0);
    });

    it("should successfully add a new food without an image", async () => {
      // Arrange
      const newFoodData = {
        name: "New Test Food No Image",
        description: "Another tasty food without an image",
        price: 20,
        categoryId: testCategoryId.toString(),
      };

      // Act
      const res = await request(app)
        .post("/api/food")
        .field("name", newFoodData.name)
        .field("description", newFoodData.description)
        .field("price", newFoodData.price)
        .field("categoryId", newFoodData.categoryId);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã thêm sản phẩm mới");
      expect(res.body.food).toBeDefined();
      expect(res.body.food.name).toBe(newFoodData.name);
      expect(res.body.food.image).toBeNull(); // No image should be null

      const createdFood = await Food.findById(res.body.food._id);
      expect(createdFood).toBeDefined();
      expect(createdFood.image).toBeNull();

      const createdStock = await Stock.findOne({ foodId: createdFood._id });
      expect(createdStock).toBeDefined();
      expect(createdStock.quantity).toBe(0);
    });

    it("should return 400 if food with same name and category already exists", async () => {
      // Arrange
      const existingFoodName = "Existing Food";
      await Food.create({
        name: existingFoodName,
        description: "Desc",
        price: 10,
        categoryId: testCategoryId,
        image: "existing.png",
      });

      const newFoodData = {
        name: existingFoodName,
        description: "Duplicate food desc",
        price: 15,
        categoryId: testCategoryId.toString(),
      };

      // Act
      const res = await request(app)
        .post("/api/food")
        .field("name", newFoodData.name)
        .field("description", newFoodData.description)
        .field("price", newFoodData.price)
        .field("categoryId", newFoodData.categoryId);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Sản phẩm này đã tồn tại trong danh mục. Vui lòng nhập thêm số lượng trong kho.");
    });

    it("should return 500 if required fields are missing (e.g., name)", async () => {
      // Arrange
      const newFoodData = {
        description: "A description",
        price: 15,
        categoryId: testCategoryId.toString(),
      }; // Missing name

      // Act
      const res = await request(app)
        .post("/api/food")
        .field("description", newFoodData.description)
        .field("price", newFoodData.price)
        .field("categoryId", newFoodData.categoryId);

      // Assert
      expect(res.statusCode).toBe(500); // Mongoose validation errors result in 500 if not explicitly handled
      expect(res.body.success).toBe(false);
      // The specific message might vary based on Mongoose's error handling and what's caught by error.message
      expect(res.body.message).toContain("Food validation failed: name: Path `name` is required.");
    });

    it("should return 500 if price is not a number", async () => {
      // Arrange
      const newFoodData = {
        name: "Invalid Price Food",
        description: "Description",
        price: "invalid", // Invalid price
        categoryId: testCategoryId.toString(),
      };

      // Act
      const res = await request(app)
        .post("/api/food")
        .field("name", newFoodData.name)
        .field("description", newFoodData.description)
        .field("price", newFoodData.price)
        .field("categoryId", newFoodData.categoryId);

      // Assert
      expect(res.statusCode).toBe(500); // Mongoose validation error
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Food validation failed: price: Cast to Number failed for value \"invalid\"");
    });

    it("should return 500 for a general internal server error during add", async () => {
      // Arrange: Mock Food.create to throw an error
      vi.spyOn(Food, "create").mockImplementationOnce(() => {
        throw new Error("Simulated DB error during create");
      });
      const newFoodData = {
        name: "Error Food",
        description: "Error desc",
        price: 10,
        categoryId: testCategoryId.toString(),
      };

      // Act
      const res = await request(app)
        .post("/api/food")
        .field("name", newFoodData.name)
        .field("description", newFoodData.description)
        .field("price", newFoodData.price)
        .field("categoryId", newFoodData.categoryId);

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Simulated DB error during create");
    });
  });

  describe("PUT /api/food/:id - updateFood", () => {
    beforeEach(async () => {
      // Arrange: Create a food to update for each test
      const food = await createTestFood(testCategoryId, 'initial');
      testFoodId = food._id.toString();
    });

    it("should successfully update food details and change image", async () => {
      // Arrange
      const updatedFoodData = {
        name: "Updated Food Name",
        description: "Updated description",
        price: 25,
        categoryId: testCategoryId.toString(),
      };
      const newImageFilename = "new-image.png";
      const oldImageFilename = "food-image-initial.png";

      // Act
      const res = await request(app)
        .put(`/api/food/${testFoodId}`)
        .field("name", updatedFoodData.name)
        .field("description", updatedFoodData.description)
        .field("price", updatedFoodData.price)
        .field("categoryId", updatedFoodData.categoryId)
        .attach("image", Buffer.from("new image content"), newImageFilename);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Cập nhật thành công");
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toBe(testFoodId);
      expect(res.body.data.name).toBe(updatedFoodData.name);
      expect(res.body.data.image).toBe(newImageFilename);

      const updatedFood = await Food.findById(testFoodId);
      expect(updatedFood.name).toBe(updatedFoodData.name);
      expect(updatedFood.image).toBe(newImageFilename);
      expect(fs.unlink).toHaveBeenCalledWith(`uploads/${oldImageFilename}`, expect.any(Function));
    });

    it("should successfully update food details without changing image", async () => {
      // Arrange
      const updatedFoodData = {
        name: "Updated Food Name No Image Change",
        description: "Updated description without image",
        price: 30,
        categoryId: testCategoryId.toString(),
      };
      const oldImageFilename = "food-image-initial.png";

      // Act
      const res = await request(app)
        .put(`/api/food/${testFoodId}`)
        .field("name", updatedFoodData.name)
        .field("description", updatedFoodData.description)
        .field("price", updatedFoodData.price)
        .field("categoryId", updatedFoodData.categoryId);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Cập nhật thành công");
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toBe(testFoodId);
      expect(res.body.data.name).toBe(updatedFoodData.name);
      expect(res.body.data.image).toBe(oldImageFilename); // Image should remain unchanged

      const updatedFood = await Food.findById(testFoodId);
      expect(updatedFood.name).toBe(updatedFoodData.name);
      expect(updatedFood.image).toBe(oldImageFilename);
      expect(fs.unlink).not.toHaveBeenCalled(); // fs.unlink should not be called
    });

    it("should return 400 if ID is 'undefined'", async () => {
      // Act
      const res = await request(app)
        .put("/api/food/undefined")
        .field("name", "test");

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("ID không hợp lệ");
    });

    it("should return 500 if ID is invalid (malformed ObjectId)", async () => {
      // Act
      const res = await request(app)
        .put("/api/food/invalidObjectId")
        .field("name", "test")
        .field("description", "desc")
        .field("price", 10)
        .field("categoryId", testCategoryId.toString());

      // Assert
      // Mongoose will throw a CastError for invalid ObjectId, leading to 500
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Cast to ObjectId failed for value \"invalidObjectId\"");
    });

    it("should return 404 if food is not found", async () => {
      // Arrange
      const nonExistentId = "60c72b1f9c1b3c001f8e4e1a"; // A valid-looking but non-existent ObjectId

      // Act
      const res = await request(app)
        .put(`/api/food/${nonExistentId}`)
        .field("name", "Non Existent Update")
        .field("description", "desc")
        .field("price", 10)
        .field("categoryId", testCategoryId.toString());

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Không tìm thấy sản phẩm");
    });

    it("should return 500 if an internal server error occurs during update", async () => {
      // Arrange: Mock Food.findByIdAndUpdate to throw an error
      vi.spyOn(Food, "findByIdAndUpdate").mockImplementationOnce(() => {
        throw new Error("Simulated DB error during update");
      });

      const updatedFoodData = {
        name: "Updated Food Name",
        description: "Updated description",
        price: 25,
        categoryId: testCategoryId.toString(),
      };

      // Act
      const res = await request(app)
        .put(`/api/food/${testFoodId}`)
        .field("name", updatedFoodData.name)
        .field("description", updatedFoodData.description)
        .field("price", updatedFoodData.price)
        .field("categoryId", updatedFoodData.categoryId);

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Simulated DB error during update");
    });

    it("should handle fs.unlink errors gracefully (log and continue)", async () => {
      // Arrange: Mock fs.unlink to throw an error (not ENOENT)
      vi.spyOn(fs, "unlink").mockImplementationOnce((path, callback) => {
        callback(new Error("Simulated unlink error"));
      });
      vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error output during this test

      const updatedFoodData = {
        name: "Updated Food Name With Unlink Error",
        description: "Updated description",
        price: 25,
        categoryId: testCategoryId.toString(),
      };
      const newImageFilename = "new-image-with-unlink-error.png";
      const oldImageFilename = "food-image-initial.png";

      // Act
      const res = await request(app)
        .put(`/api/food/${testFoodId}`)
        .field("name", updatedFoodData.name)
        .field("description", updatedFoodData.description)
        .field("price", updatedFoodData.price)
        .field("categoryId", updatedFoodData.categoryId)
        .attach("image", Buffer.from("new image content"), newImageFilename);

      // Assert
      expect(res.statusCode).toBe(200); // Should still succeed as unlink error is caught
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Cập nhật thành công");
      expect(fs.unlink).toHaveBeenCalledWith(`uploads/${oldImageFilename}`, expect.any(Function));
      expect(console.error).toHaveBeenCalledWith("❌ unlink error:", expect.any(Error));
      console.error.mockRestore(); // Restore console.error
    });
  });

  describe("DELETE /api/food - removeFood", () => {
    beforeEach(async () => {
      // Arrange: Create a food to delete for each test
      const food = await createTestFood(testCategoryId, 'delete');
      testFoodId = food._id.toString();
    });

    it("should successfully delete an existing food with an image", async () => {
      // Arrange
      const foodToDelete = await Food.findById(testFoodId);
      const foodImage = foodToDelete.image;

      // Act
      const res = await request(app)
        .delete("/api/food")
        .send({ id: testFoodId });

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã xóa sản phẩm");

      const deletedFood = await Food.findById(testFoodId);
      expect(deletedFood).toBeNull();

      const deletedStock = await Stock.findOne({ foodId: testFoodId });
      expect(deletedStock).toBeNull();

      expect(fs.unlink).toHaveBeenCalledWith(`uploads/${foodImage}`, expect.any(Function));
    });

    it("should successfully delete an existing food without an image", async () => {
      // Arrange: Create a food without an image
      await Food.findByIdAndUpdate(testFoodId, { image: null }); // Remove image
      const foodToDelete = await Food.findById(testFoodId);
      expect(foodToDelete.image).toBeNull();

      // Act
      const res = await request(app)
        .delete("/api/food")
        .send({ id: testFoodId });

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã xóa sản phẩm");

      const deletedFood = await Food.findById(testFoodId);
      expect(deletedFood).toBeNull();

      const deletedStock = await Stock.findOne({ foodId: testFoodId });
      expect(deletedStock).toBeNull();

      expect(fs.unlink).not.toHaveBeenCalled(); // fs.unlink should not be called
    });

    it("should return 404 if food to delete is not found", async () => {
      // Arrange
      const nonExistentId = "60c72b1f9c1b3c001f8e4e1a"; // Valid-looking but non-existent ObjectId

      // Act
      const res = await request(app)
        .delete("/api/food")
        .send({ id: nonExistentId });

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Không tìm thấy sản phẩm");
    });

    it("should return 500 if ID is invalid (CastError)", async () => {
      // Arrange
      const invalidId = "invalidObjectId";

      // Act
      const res = await request(app)
        .delete("/api/food")
        .send({ id: invalidId });

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Error"); // The controller catches Mongoose CastError and returns generic "Error"
    });

    it("should return 500 if no ID is provided in request body", async () => {
      // Act
      const res = await request(app)
        .delete("/api/food")
        .send({}); // Missing ID

      // Assert
      expect(res.statusCode).toBe(500); // Mongoose Food.findById(undefined) results in a CastError internally
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Error");
    });

    it("should handle fs.unlink errors gracefully (log and continue)", async () => {
      // Arrange: Mock fs.unlink to throw an error (not ENOENT)
      vi.spyOn(fs, "unlink").mockImplementationOnce((path, callback) => {
        callback(new Error("Simulated unlink error during delete"));
      });
      vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error output during this test

      const foodToDelete = await Food.findById(testFoodId);
      const foodImage = foodToDelete.image;

      // Act
      const res = await request(app)
        .delete("/api/food")
        .send({ id: testFoodId });

      // Assert
      expect(res.statusCode).toBe(200); // Should still succeed as unlink error is caught
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã xóa sản phẩm");
      expect(fs.unlink).toHaveBeenCalledWith(`uploads/${foodImage}`, expect.any(Function));
      expect(console.error).toHaveBeenCalledWith("❌ unlink error:", expect.any(Error));
      console.error.mockRestore(); // Restore console.error
    });

    it("should return 500 for a general internal server error during remove", async () => {
      // Arrange: Mock Food.findById to throw an error
      vi.spyOn(Food, "findById").mockImplementationOnce(() => {
        throw new Error("Simulated DB error during findById for delete");
      });

      // Act
      const res = await request(app)
        .delete("/api/food")
        .send({ id: testFoodId });

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Error");
    });
  });
});