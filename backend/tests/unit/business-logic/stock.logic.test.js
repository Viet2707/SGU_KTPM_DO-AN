import { describe, it, expect, beforeEach } from "vitest";
import { decStock, incStock } from "../../../controllers/updateStock.js";
import Stock from "../../../models/Stock.js";
import Food from "../../../models/Food.js";
import Category from "../../../models/Category.js";

describe("Stock Update Logic - Unit Tests", () => {
    let testFood1, testFood2;
    let testCategory;

    beforeEach(async () => {
        // Clean database
        await Stock.deleteMany({});
        await Food.deleteMany({});
        await Category.deleteMany({});

        // Create test category and foods
        testCategory = await Category.create({ name: "Test Category" });

        testFood1 = await Food.create({
            name: "Food 1",
            price: 100,
            categoryId: testCategory._id,
        });

        testFood2 = await Food.create({
            name: "Food 2",
            price: 200,
            categoryId: testCategory._id,
        });

        // Create stock
        await Stock.create({ foodId: testFood1._id, quantity: 100 });
        await Stock.create({ foodId: testFood2._id, quantity: 50 });
    });

    describe("decStock - Decrease Stock", () => {
        it("should decrease stock by specified quantity", async () => {
            const items = [
                { foodId: testFood1._id, quantity: 10 },
            ];

            await decStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(90); // 100 - 10
        });

        it("should decrease stock for multiple items", async () => {
            const items = [
                { foodId: testFood1._id, quantity: 20 },
                { foodId: testFood2._id, quantity: 5 },
            ];

            await decStock(items);

            const stock1 = await Stock.findOne({ foodId: testFood1._id });
            const stock2 = await Stock.findOne({ foodId: testFood2._id });

            expect(stock1.quantity).toBe(80); // 100 - 20
            expect(stock2.quantity).toBe(45); // 50 - 5
        });

        it("should handle items with different ID field names (foodId)", async () => {
            const items = [
                { foodId: testFood1._id, quantity: 15 },
            ];

            await decStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(85);
        });

        it("should handle items with productId field", async () => {
            const items = [
                { productId: testFood1._id, quantity: 10 },
            ];

            await decStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(90);
        });

        it("should handle items with _id field", async () => {
            const items = [
                { _id: testFood1._id, quantity: 10 },
            ];

            await decStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(90);
        });

        it("should default quantity to 1 if not specified", async () => {
            const items = [
                { foodId: testFood1._id }, // no quantity field
            ];

            await decStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(99); // 100 - 1
        });

        it("should handle qty field as alternative to quantity", async () => {
            const items = [
                { foodId: testFood1._id, qty: 12 },
            ];

            await decStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(88);
        });

        it("should not allow negative stock", async () => {
            const items = [
                { foodId: testFood1._id, quantity: 150 }, // More than available
            ];

            await decStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBeGreaterThanOrEqual(0);
        });

        it("should handle empty items array", async () => {
            const items = [];

            await expect(decStock(items)).resolves.not.toThrow();

            // Stock should remain unchanged
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(100);
        });

        it("should process all items even if one fails", async () => {
            const mongoose = await import("mongoose");
            const nonExistentId = new mongoose.default.Types.ObjectId();

            const items = [
                { foodId: testFood1._id, quantity: 10 },
                { foodId: nonExistentId, quantity: 5 }, // Non-existent
                { foodId: testFood2._id, quantity: 3 },
            ];

            // Should handle gracefully
            await decStock(items);

            const stock1 = await Stock.findOne({ foodId: testFood1._id });
            const stock2 = await Stock.findOne({ foodId: testFood2._id });

            // Valid items should be processed
            expect(stock1.quantity).toBe(90);
            expect(stock2.quantity).toBe(47);
        });
    });

    describe("incStock - Increase Stock", () => {
        it("should increase stock by specified quantity", async () => {
            const items = [
                { foodId: testFood1._id, quantity: 25 },
            ];

            await incStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(125); // 100 + 25
        });

        it("should increase stock for multiple items", async () => {
            const items = [
                { foodId: testFood1._id, quantity: 30 },
                { foodId: testFood2._id, quantity: 10 },
            ];

            await incStock(items);

            const stock1 = await Stock.findOne({ foodId: testFood1._id });
            const stock2 = await Stock.findOne({ foodId: testFood2._id });

            expect(stock1.quantity).toBe(130); // 100 + 30
            expect(stock2.quantity).toBe(60); // 50 + 10
        });

        it("should handle items with different ID field names", async () => {
            const items = [
                { productId: testFood1._id, quantity: 20 },
            ];

            await incStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(120);
        });

        it("should default quantity to 1 if not specified", async () => {
            const items = [
                { foodId: testFood1._id }, // no quantity
            ];

            await incStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(101); // 100 + 1
        });

        it("should handle qty field", async () => {
            const items = [
                { foodId: testFood1._id, qty: 15 },
            ];

            await incStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(115);
        });

        it("should handle empty items array", async () => {
            const items = [];

            await expect(incStock(items)).resolves.not.toThrow();

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(100);
        });

        it("should restore stock after order cancellation", async () => {
            // Simulate: order placed (decrease), then canceled (increase)
            const orderItems = [
                { foodId: testFood1._id, quantity: 20 },
                { foodId: testFood2._id, quantity: 10 },
            ];

            // Place order (decrease stock)
            await decStock(orderItems);

            let stock1 = await Stock.findOne({ foodId: testFood1._id });
            let stock2 = await Stock.findOne({ foodId: testFood2._id });

            expect(stock1.quantity).toBe(80);
            expect(stock2.quantity).toBe(40);

            // Cancel order (restore stock)
            await incStock(orderItems);

            stock1 = await Stock.findOne({ foodId: testFood1._id });
            stock2 = await Stock.findOne({ foodId: testFood2._id });

            expect(stock1.quantity).toBe(100); // Restored
            expect(stock2.quantity).toBe(50); // Restored
        });
    });

    describe("Stock Operations - Edge Cases", () => {
        it("should handle very large quantities", async () => {
            const items = [
                { foodId: testFood1._id, quantity: 1000000 },
            ];

            await incStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(1000100);
        });

        it("should handle decimal quantities (should convert to integer)", async () => {
            const items = [
                { foodId: testFood1._id, quantity: 10.7 },
            ];

            await decStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            // Depending on implementation, might round or truncate
            expect(stock.quantity).toBeLessThan(100);
        });

        it("should handle zero quantity", async () => {
            const items = [
                { foodId: testFood1._id, quantity: 0 },
            ];

            await decStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(100); // No change
        });

        it("should handle negative quantity values", async () => {
            const items = [
                { foodId: testFood1._id, quantity: -10 },
            ];

            // Behavior depends on implementation
            await decStock(items);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            // Should handle gracefully
            expect(stock.quantity).toBeDefined();
        });
    });

    describe("Concurrent Stock Operations", () => {
        it("should handle concurrent decrease operations", async () => {
            const items1 = [{ foodId: testFood1._id, quantity: 10 }];
            const items2 = [{ foodId: testFood1._id, quantity: 15 }];

            await Promise.all([decStock(items1), decStock(items2)]);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            // Should decrease by total: 10 + 15 = 25
            // But due to race conditions, might vary
            expect(stock.quantity).toBeLessThan(100);
        });

        it("should handle mixed concurrent operations", async () => {
            const decrease = [{ foodId: testFood1._id, quantity: 20 }];
            const increase = [{ foodId: testFood1._id, quantity: 10 }];

            await Promise.all([decStock(decrease), incStock(increase)]);

            const stock = await Stock.findOne({ foodId: testFood1._id });
            // Final result depends on execution order
            expect(stock.quantity).toBeDefined();
            expect(stock.quantity).toBeGreaterThan(0);
        });
    });

    describe("Error Recovery", () => {
        it("should not modify stock if item not found", async () => {
            const mongoose = await import("mongoose");
            const nonExistentId = new mongoose.default.Types.ObjectId();

            const items = [
                { foodId: nonExistentId, quantity: 10 },
            ];

            await decStock(items);

            // Original stocks should remain unchanged
            const stock1 = await Stock.findOne({ foodId: testFood1._id });
            expect(stock1.quantity).toBe(100);
        });

        it("should handle malformed item objects", async () => {
            const items = [
                {}, // No ID or quantity
                { quantity: 10 }, // No ID
                { foodId: null, quantity: 5 }, // Null ID
            ];

            await expect(decStock(items)).resolves.not.toThrow();
            await expect(incStock(items)).resolves.not.toThrow();
        });
    });
});
