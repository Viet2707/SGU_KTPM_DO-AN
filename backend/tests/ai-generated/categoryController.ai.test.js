import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js"; // Adjust path as necessary
import Category from "../../models/Category.js"; // Adjust path as necessary

const TEST_DB_URI = process.env.MONGO_URI_TEST || "mongodb://localhost:27017/vitest_category_db";

describe("Category API Integration Tests", () => {
  // Connect to a test database before all tests
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) { // Check if not already connected
      await mongoose.connect(TEST_DB_URI);
    }
  });

  // Clear the database and seed initial data before each test
  beforeEach(async () => {
    await Category.deleteMany({});
  });

  // Disconnect from the database after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // --- GET /api/category and GET /api/category/list ---
  describe("GET /api/category and GET /api/category/list", () => {
    it("should return an empty array if no categories exist", async () => {
      // Act
      const res = await request(app).get("/api/category");

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.categories).toEqual([]);
    });

    it("should return a list of categories when they exist (GET /)", async () => {
      // Arrange
      await Category.create({ name: "Category 1" });
      await Category.create({ name: "Category 2" });

      // Act
      const res = await request(app).get("/api/category");

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.categories).toHaveLength(2);
      expect(res.body.categories[0].name).toBe("Category 1");
      expect(res.body.categories[1].name).toBe("Category 2");
    });

    it("should return a list of categories when they exist (GET /list)", async () => {
      // Arrange
      await Category.create({ name: "Category A" });
      await Category.create({ name: "Category B" });

      // Act
      const res = await request(app).get("/api/category/list");

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.categories).toHaveLength(2);
      expect(res.body.categories[0].name).toBe("Category A");
      expect(res.body.categories[1].name).toBe("Category B");
    });
  });

  // --- POST /api/category ---
  describe("POST /api/category", () => {
    it("should create a new category successfully with valid data", async () => {
      // Arrange
      const newCategory = { name: "New Category" };

      // Act
      const res = await request(app).post("/api/category").send(newCategory);

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.category).toHaveProperty("_id");
      expect(res.body.category.name).toBe(newCategory.name);

      const categoryInDb = await Category.findById(res.body.category._id);
      expect(categoryInDb).not.toBeNull();
      expect(categoryInDb.name).toBe(newCategory.name);
    });

    it("should return an error if 'name' is missing", async () => {
      // Act
      const res = await request(app).post("/api/category").send({});

      // Assert
      expect(res.statusCode).toEqual(200); // Controller returns 200 for validation errors
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Tên category không được rỗng");
    });

    it("should return an error if 'name' is an empty string", async () => {
      // Act
      const res = await request(app).post("/api/category").send({ name: "" });

      // Assert
      expect(res.statusCode).toEqual(200); // Controller returns 200 for validation errors
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Tên category không được rỗng");
    });
  });

  // --- PUT /api/category/:id ---
  describe("PUT /api/category/:id", () => {
    it("should update an existing category successfully", async () => {
      // Arrange
      const category = await Category.create({ name: "Original Name" });
      const updatedData = { name: "Updated Name" };

      // Act
      const res = await request(app)
        .put(`/api/category/${category._id}`)
        .send(updatedData);

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.category._id).toBe(category._id.toString());
      expect(res.body.category.name).toBe(updatedData.name);

      const categoryInDb = await Category.findById(category._id);
      expect(categoryInDb.name).toBe(updatedData.name);
    });

    it("should return an error if category ID is not found", async () => {
      // Arrange
      const nonExistentId = new mongoose.Types.ObjectId(); // Create a valid but non-existent ID
      const updatedData = { name: "Non-existent Category Update" };

      // Act
      const res = await request(app)
        .put(`/api/category/${nonExistentId}`)
        .send(updatedData);

      // Assert
      expect(res.statusCode).toEqual(200); // Controller returns 200 for not found message
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Không tìm thấy category");
    });

    it("should return a 500 error if ID format is invalid", async () => {
      // Arrange
      const invalidId = "invalid-id-format";
      const updatedData = { name: "Updated Name" };

      // Act
      const res = await request(app)
        .put(`/api/category/${invalidId}`)
        .send(updatedData);

      // Assert
      expect(res.statusCode).toEqual(500); // Mongoose cast error leads to 500
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Cast to ObjectId failed for value");
    });

    it("should allow updating category name to an empty string", async () => {
      // Arrange
      const category = await Category.create({ name: "Original Name" });
      const updatedData = { name: "" }; // Update with an empty string

      // Act
      const res = await request(app)
        .put(`/api/category/${category._id}`)
        .send(updatedData);

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.category.name).toBe("");

      const categoryInDb = await Category.findById(category._id);
      expect(categoryInDb.name).toBe("");
    });
  });

  // --- DELETE /api/category/:id ---
  describe("DELETE /api/category/:id", () => {
    it("should delete an existing category successfully", async () => {
      // Arrange
      const category = await Category.create({ name: "Category to Delete" });

      // Act
      const res = await request(app).delete(`/api/category/${category._id}`);

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã xoá category");

      const categoryInDb = await Category.findById(category._id);
      expect(categoryInDb).toBeNull();
    });

    it("should return an error if category ID is not found during deletion", async () => {
      // Arrange
      const nonExistentId = new mongoose.Types.ObjectId(); // Create a valid but non-existent ID

      // Act
      const res = await request(app).delete(`/api/category/${nonExistentId}`);

      // Assert
      expect(res.statusCode).toEqual(200); // Controller returns 200 for not found message
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Không tìm thấy category");
    });

    it("should return a 500 error if ID format is invalid during deletion", async () => {
      // Arrange
      const invalidId = "invalid-id-to-delete";

      // Act
      const res = await request(app).delete(`/api/category/${invalidId}`);

      // Assert
      expect(res.statusCode).toEqual(500); // Mongoose cast error leads to 500
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Cast to ObjectId failed for value");
    });
  });
});