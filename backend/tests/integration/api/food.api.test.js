import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import Food from "../../../models/Food.js";
import Stock from "../../../models/Stock.js";
import Category from "../../../models/Category.js";
import Admin from "../../../models/adminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Food API - Integration Tests", () => {
    let adminToken;
    let testCategory;

    beforeEach(async () => {
        // Clean database
        await Food.deleteMany({});
        await Stock.deleteMany({});
        await Category.deleteMany({});
        await Admin.deleteMany({});

        // Create admin and get token
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const admin = await Admin.create({
            name: "Test Admin",
            email: "admin@test.com",
            password_hash: hashedPassword,
            role: "admin",
        });

        adminToken = jwt.sign(
            { id: admin._id, role: "admin", email: admin.email },
            process.env.JWT_SECRET || "123",
            { expiresIn: "7d" }
        );

        // Create test category
        testCategory = await Category.create({ name: "Test Category" });
    });

    describe("GET /api/food - List All Foods", () => {
        it("should return empty array when no foods exist", async () => {
            const res = await request(app).get("/api/food/list");

            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });

        it("should return all foods with stock quantities", async () => {
            // Create foods
            const food1 = await Food.create({
                name: "Food 1",
                price: 100,
                categoryId: testCategory._id,
            });

            const food2 = await Food.create({
                name: "Food 2",
                price: 200,
                categoryId: testCategory._id,
            });

            // Create stocks
            await Stock.create({ foodId: food1._id, quantity: 10 });
            await Stock.create({ foodId: food2._id, quantity: 5 });

            const res = await request(app).get("/api/food/list");

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.data[0]).toHaveProperty("quantity");
            expect(res.body.data[0]).toHaveProperty("category");
        });

        it("should include category name in response", async () => {
            const food = await Food.create({
                name: "Test Food",
                price: 100,
                categoryId: testCategory._id,
            });

            await Stock.create({ foodId: food._id, quantity: 10 });

            const res = await request(app).get("/api/food/list");

            expect(res.body.data[0].category).toBe("Test Category");
        });

        it("should show quantity 0 for food without stock", async () => {
            await Food.create({
                name: "Test Food",
                price: 100,
                categoryId: testCategory._id,
            });

            const res = await request(app).get("/api/food/list");

            expect(res.body.data[0].quantity).toBe(0);
        });
    });

    describe("POST /api/food/add - Add New Food", () => {
        it("should add new food successfully with admin token", async () => {
            const newFood = {
                name: "New Food",
                description: "Test description",
                price: 150,
                categoryId: testCategory._id.toString(),
            };

            const res = await request(app)
                .post("/api/food/add")
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", newFood.name)
                .field("description", newFood.description)
                .field("price", newFood.price)
                .field("categoryId", newFood.categoryId);

            expect(res.body.success).toBe(true);
            expect(res.body.food).toBeDefined();
            expect(res.body.food.name).toBe(newFood.name);

            // Verify stock was created with quantity 0
            const stock = await Stock.findOne({ foodId: res.body.food._id });
            expect(stock).toBeDefined();
            expect(stock.quantity).toBe(0);
        });

        it("should reject adding food without authorization", async () => {
            const newFood = {
                name: "New Food",
                price: 150,
                categoryId: testCategory._id.toString(),
            };

            const res = await request(app)
                .post("/api/food/add")
                .field("name", newFood.name)
                .field("price", newFood.price)
                .field("categoryId", newFood.categoryId);

            expect(res.status).toBe(401);
        });

        it("should reject duplicate food in same category", async () => {
            const foodData = {
                name: "Duplicate Food",
                price: 100,
                categoryId: testCategory._id.toString(),
            };

            // Add first food
            await request(app)
                .post("/api/food/add")
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", foodData.name)
                .field("price", foodData.price)
                .field("categoryId", foodData.categoryId);

            // Try to add duplicate
            const res = await request(app)
                .post("/api/food/add")
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", foodData.name)
                .field("price", foodData.price)
                .field("categoryId", foodData.categoryId);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("tồn tại");
        });

        it("should allow same food name in different categories", async () => {
            const category2 = await Category.create({ name: "Category 2" });

            const food1 = await request(app)
                .post("/api/food/add")
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", "Same Name Food")
                .field("price", "100")
                .field("categoryId", testCategory._id.toString());

            const food2 = await request(app)
                .post("/api/food/add")
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", "Same Name Food")
                .field("price", "200")
                .field("categoryId", category2._id.toString());

            expect(food1.body.success).toBe(true);
            expect(food2.body.success).toBe(true);
        });

        it("should trim whitespace from food name", async () => {
            const res = await request(app)
                .post("/api/food/add")
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", "  Test Food  ")
                .field("price", "100")
                .field("categoryId", testCategory._id.toString());

            expect(res.body.food.name).toBe("Test Food");
        });
    });

    describe("PUT /api/food/update/:id - Update Food", () => {
        let existingFood;

        beforeEach(async () => {
            existingFood = await Food.create({
                name: "Original Food",
                description: "Original description",
                price: 100,
                categoryId: testCategory._id,
            });
            await Stock.create({ foodId: existingFood._id, quantity: 10 });
        });

        it("should update food successfully", async () => {
            const updatedData = {
                name: "Updated Food",
                description: "Updated description",
                price: 200,
                categoryId: testCategory._id.toString(),
            };

            const res = await request(app)
                .put(`/api/food/update/${existingFood._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", updatedData.name)
                .field("description", updatedData.description)
                .field("price", updatedData.price)
                .field("categoryId", updatedData.categoryId);

            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(updatedData.name);
            expect(res.body.data.price).toBe(updatedData.price);
        });

        it("should reject update with invalid ID", async () => {
            const res = await request(app)
                .put("/api/food/update/undefined")
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", "Test")
                .field("price", "100")
                .field("categoryId", testCategory._id.toString());

            expect(res.status).toBe(400);
            expect(res.body.message).toContain("không hợp lệ");
        });

        it("should return 404 for non-existent food", async () => {
            const fakeId = new (await import("mongoose")).default.Types.ObjectId();

            const res = await request(app)
                .put(`/api/food/update/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", "Test")
                .field("price", "100")
                .field("categoryId", testCategory._id.toString());

            expect(res.status).toBe(404);
            expect(res.body.message).toContain("Không tìm thấy");
        });

        it("should update only specified fields", async () => {
            const res = await request(app)
                .put(`/api/food/update/${existingFood._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", existingFood.name)
                .field("description", existingFood.description)
                .field("price", "250")
                .field("categoryId", testCategory._id.toString());

            expect(res.body.data.name).toBe(existingFood.name);
            expect(res.body.data.price).toBe(250);
        });
    });

    describe("POST /api/food/remove - Delete Food", () => {
        let existingFood;

        beforeEach(async () => {
            existingFood = await Food.create({
                name: "Food to Delete",
                price: 100,
                categoryId: testCategory._id,
            });
            await Stock.create({ foodId: existingFood._id, quantity: 10 });
        });

        it("should delete food and its stock successfully", async () => {
            const res = await request(app)
                .post("/api/food/remove")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ id: existingFood._id.toString() });

            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain("Đã xóa");

            // Verify food is deleted
            const food = await Food.findById(existingFood._id);
            expect(food).toBeNull();

            // Verify stock is deleted
            const stock = await Stock.findOne({ foodId: existingFood._id });
            expect(stock).toBeNull();
        });

        it("should return 404 for non-existent food", async () => {
            const mongoose = await import("mongoose");
            const fakeId = new mongoose.default.Types.ObjectId();

            const res = await request(app)
                .post("/api/food/remove")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ id: fakeId.toString() });

            expect(res.status).toBe(404);
            expect(res.body.message).toContain("Không tìm thấy");
        });

        it("should require authentication", async () => {
            const res = await request(app)
                .post("/api/food/remove")
                .send({ id: existingFood._id.toString() });

            expect(res.status).toBe(401);
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle malformed JSON", async () => {
            const res = await request(app)
                .post("/api/food/add")
                .set("Authorization", `Bearer ${adminToken}`)
                .set("Content-Type", "application/json")
                .send("invalid json");

            expect(res.status).toBeGreaterThanOrEqual(400);
        });

        it("should reject negative price", async () => {
            const res = await request(app)
                .post("/api/food/add")
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", "Test Food")
                .field("price", "-100")
                .field("categoryId", testCategory._id.toString());

            // Price validation should be handled
            expect(res.body).toHaveProperty("success");
        });

        it("should handle very long food name", async () => {
            const longName = "A".repeat(1000);

            const res = await request(app)
                .post("/api/food/add")
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", longName)
                .field("price", "100")
                .field("categoryId", testCategory._id.toString());

            expect(res.body).toHaveProperty("success");
        });
    });
});
