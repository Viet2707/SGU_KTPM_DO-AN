import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import Food from "../../../models/Food.js";
import Category from "../../../models/Category.js";

describe("Food Model - Unit Tests", () => {
    let testCategory;

    beforeEach(async () => {
        // Clean up before each test
        await Food.deleteMany({});
        await Category.deleteMany({});

        // Create a test category
        testCategory = await Category.create({ name: "Test Category" });
    });

    describe("Schema Validation", () => {
        it("should create a valid food item with all required fields", async () => {
            const validFood = {
                name: "Test Food",
                description: "Test description",
                price: 100,
                image: "test.jpg",
                categoryId: testCategory._id,
            };

            const food = await Food.create(validFood);
            expect(food.name).toBe(validFood.name);
            expect(food.description).toBe(validFood.description);
            expect(food.price).toBe(validFood.price);
            expect(food.image).toBe(validFood.image);
            expect(food.categoryId.toString()).toBe(testCategory._id.toString());
        });

        it("should fail to create food without required name", async () => {
            const invalidFood = {
                description: "Test description",
                price: 100,
                categoryId: testCategory._id,
            };

            await expect(Food.create(invalidFood)).rejects.toThrow();
        });

        it("should fail to create food without required price", async () => {
            const invalidFood = {
                name: "Test Food",
                description: "Test description",
                categoryId: testCategory._id,
            };

            await expect(Food.create(invalidFood)).rejects.toThrow();
        });

        it("should fail to create food without required categoryId", async () => {
            const invalidFood = {
                name: "Test Food",
                description: "Test description",
                price: 100,
            };

            await expect(Food.create(invalidFood)).rejects.toThrow();
        });

        it("should allow creating food without description", async () => {
            const validFood = {
                name: "Test Food",
                price: 100,
                categoryId: testCategory._id,
            };

            const food = await Food.create(validFood);
            expect(food.name).toBe(validFood.name);
            expect(food.description).toBeUndefined();
        });

        it("should allow creating food without image", async () => {
            const validFood = {
                name: "Test Food",
                price: 100,
                categoryId: testCategory._id,
            };

            const food = await Food.create(validFood);
            expect(food.name).toBe(validFood.name);
            expect(food.image).toBeUndefined();
        });
    });

    describe("Unique Index Constraint", () => {
        it("should allow same food name in different categories", async () => {
            const category2 = await Category.create({ name: "Category 2" });

            const food1 = await Food.create({
                name: "Same Name",
                price: 100,
                categoryId: testCategory._id,
            });

            const food2 = await Food.create({
                name: "Same Name",
                price: 200,
                categoryId: category2._id,
            });

            expect(food1.name).toBe(food2.name);
            expect(food1.categoryId.toString()).not.toBe(food2.categoryId.toString());
        });

        it("should NOT allow duplicate food name in same category", async () => {
            await Food.create({
                name: "Duplicate Food",
                price: 100,
                categoryId: testCategory._id,
            });

            // Try to create duplicate
            await expect(
                Food.create({
                    name: "Duplicate Food",
                    price: 200,
                    categoryId: testCategory._id,
                })
            ).rejects.toThrow();
        });
    });

    describe("Name Trimming", () => {
        it("should trim whitespace from food name", async () => {
            const food = await Food.create({
                name: "  Test Food  ",
                price: 100,
                categoryId: testCategory._id,
            });

            expect(food.name).toBe("Test Food");
        });
    });

    describe("Price Validation", () => {
        it("should accept positive price", async () => {
            const food = await Food.create({
                name: "Test Food",
                price: 100,
                categoryId: testCategory._id,
            });

            expect(food.price).toBe(100);
        });

        it("should accept price as 0", async () => {
            const food = await Food.create({
                name: "Free Food",
                price: 0,
                categoryId: testCategory._id,
            });

            expect(food.price).toBe(0);
        });

        it("should accept decimal price", async () => {
            const food = await Food.create({
                name: "Test Food",
                price: 99.99,
                categoryId: testCategory._id,
            });

            expect(food.price).toBe(99.99);
        });
    });

    describe("Category Reference", () => {
        it("should properly reference category", async () => {
            const food = await Food.create({
                name: "Test Food",
                price: 100,
                categoryId: testCategory._id,
            });

            const populatedFood = await Food.findById(food._id).populate("categoryId");
            expect(populatedFood.categoryId.name).toBe("Test Category");
        });
    });

    describe("Timestamps", () => {
        it("should have createdAt and updatedAt timestamps", async () => {
            const food = await Food.create({
                name: "Test Food",
                price: 100,
                categoryId: testCategory._id,
            });

            expect(food.createdAt).toBeDefined();
            expect(food.updatedAt).toBeDefined();
            expect(food.createdAt).toBeInstanceOf(Date);
            expect(food.updatedAt).toBeInstanceOf(Date);
        });

        it("should update updatedAt on modification", async () => {
            const food = await Food.create({
                name: "Test Food",
                price: 100,
                categoryId: testCategory._id,
            });

            const originalUpdatedAt = food.updatedAt;

            // Wait a bit and update
            await new Promise((resolve) => setTimeout(resolve, 100));

            food.price = 200;
            await food.save();

            expect(food.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        });
    });
});
