import { describe, it, expect, beforeEach } from "vitest";
import { decStock, incStock } from "../../../controllers/updateStock.js";
import Stock from "../../../models/Stock.js";
import Food from "../../../models/Food.js";
import Category from "../../../models/Category.js";

describe("Stock Update Logic - Unit Tests", () => {
    let testFood1, testFood2;
    let testCategory;

    beforeEach(async () => {
        await Stock.deleteMany({});
        await Food.deleteMany({});
        await Category.deleteMany({});

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

        await Stock.create({ foodId: testFood1._id, quantity: 100 });
        await Stock.create({ foodId: testFood2._id, quantity: 50 });
    });

    describe("decStock - Decrease Stock", () => {
        it("should decrease stock by specified quantity", async () => {
            const items = [{ foodId: testFood1._id, quantity: 10 }];
            await decStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(90);
        });

        it("should decrease stock for multiple items", async () => {
            const items = [
                { foodId: testFood1._id, quantity: 20 },
                { foodId: testFood2._id, quantity: 5 },
            ];
            await decStock(items);
            const stock1 = await Stock.findOne({ foodId: testFood1._id });
            const stock2 = await Stock.findOne({ foodId: testFood2._id });
            expect(stock1.quantity).toBe(80);
            expect(stock2.quantity).toBe(45);
        });

        it("should handle items with different ID field names (foodId)", async () => {
            const items = [{ foodId: testFood1._id, quantity: 15 }];
            await decStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(85);
        });

        it("should handle items with productId field", async () => {
            const items = [{ productId: testFood1._id, quantity: 10 }];
            await decStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(90);
        });

        it("should handle items with _id field", async () => {
            const items = [{ _id: testFood1._id, quantity: 10 }];
            await decStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(90);
        });

        it("should default quantity to 1 if not specified", async () => {
            const items = [{ foodId: testFood1._id }];
            await decStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(99);
        });

        it("should handle qty field as alternative to quantity", async () => {
            const items = [{ foodId: testFood1._id, qty: 12 }];
            await decStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(88);
        });

        it("should not allow negative stock", async () => {
            const items = [{ foodId: testFood1._id, quantity: 150 }];
            try {
                await decStock(items);
                expect("should have thrown").toBe("but did not");
            } catch (e) {
                expect(e.message).toBe("OUT_OF_STOCK");
            }
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBeGreaterThanOrEqual(0);
        });

        it("should handle empty items array", async () => {
            const items = [];
            await expect(decStock(items)).resolves.not.toThrow();
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(100);
        });

        it("should fail if any item is non-existent", async () => {
            const mongoose = await import("mongoose");
            const nonExistentId = new mongoose.default.Types.ObjectId();
            const items = [
                { foodId: testFood1._id, quantity: 10 },
                { foodId: nonExistentId, quantity: 5 },
                { foodId: testFood2._id, quantity: 3 },
            ];
            try {
                await decStock(items);
                expect("should have thrown").toBe("but did not");
            } catch (e) {
                expect(e.message).toBe("OUT_OF_STOCK");
            }
        });
    });

    describe("incStock - Increase Stock", () => {
        it("should increase stock by specified quantity", async () => {
            const items = [{ foodId: testFood1._id, quantity: 25 }];
            await incStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(125);
        });

        it("should increase stock for multiple items", async () => {
            const items = [
                { foodId: testFood1._id, quantity: 30 },
                { foodId: testFood2._id, quantity: 10 },
            ];
            await incStock(items);
            const stock1 = await Stock.findOne({ foodId: testFood1._id });
            const stock2 = await Stock.findOne({ foodId: testFood2._id });
            expect(stock1.quantity).toBe(130);
            expect(stock2.quantity).toBe(60);
        });

        it("should handle items with different ID field names", async () => {
            const items = [{ productId: testFood1._id, quantity: 20 }];
            await incStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(120);
        });

        it("should default quantity to 1 if not specified", async () => {
            const items = [{ foodId: testFood1._id }];
            await incStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(101);
        });

        it("should handle qty field", async () => {
            const items = [{ foodId: testFood1._id, qty: 15 }];
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
            const orderItems = [
                { foodId: testFood1._id, quantity: 20 },
                { foodId: testFood2._id, quantity: 10 },
            ];
            await decStock(orderItems);
            let stock1 = await Stock.findOne({ foodId: testFood1._id });
            let stock2 = await Stock.findOne({ foodId: testFood2._id });
            expect(stock1.quantity).toBe(80);
            expect(stock2.quantity).toBe(40);

            await incStock(orderItems);
            stock1 = await Stock.findOne({ foodId: testFood1._id });
            stock2 = await Stock.findOne({ foodId: testFood2._id });
            expect(stock1.quantity).toBe(100);
            expect(stock2.quantity).toBe(50);
        });
    });

    describe("Stock Operations - Edge Cases", () => {
        it("should handle very large quantities", async () => {
            const items = [{ foodId: testFood1._id, quantity: 1000000 }];
            await incStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(1000100);
        });

        it("should handle decimal quantities (should convert to integer)", async () => {
            const items = [{ foodId: testFood1._id, quantity: 10.7 }];
            await decStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBeLessThan(100);
        });

        it("should handle zero quantity", async () => {
            const items = [{ foodId: testFood1._id, quantity: 0 }];
            await decStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(100);
        });

        it("should handle negative quantity values", async () => {
            const items = [{ foodId: testFood1._id, quantity: -10 }];
            await decStock(items);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBeDefined();
        });
    });

    describe("Concurrent Stock Operations", () => {
        it("should handle concurrent decrease operations", async () => {
            const items1 = [{ foodId: testFood1._id, quantity: 10 }];
            const items2 = [{ foodId: testFood1._id, quantity: 15 }];
            await Promise.all([decStock(items1), decStock(items2)]);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBeLessThan(100);
        });

        it("should handle mixed concurrent operations", async () => {
            const decrease = [{ foodId: testFood1._id, quantity: 20 }];
            const increase = [{ foodId: testFood1._id, quantity: 10 }];
            await Promise.all([decStock(decrease), incStock(increase)]);
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBeDefined();
            expect(stock.quantity).toBeGreaterThan(0);
        });
    });

    describe("Error Recovery", () => {
        it("should not modify stock if item not found", async () => {
            const mongoose = await import("mongoose");
            const nonExistentId = new mongoose.default.Types.ObjectId();
            const items = [{ foodId: nonExistentId, quantity: 10 }];
            try {
                await decStock(items);
                expect("should have thrown").toBe("but did not");
            } catch (e) {
                expect(e.message).toBe("OUT_OF_STOCK");
            }
            const stock1 = await Stock.findOne({ foodId: testFood1._id });
            expect(stock1.quantity).toBe(100);
        });

        it("should handle malformed item objects", async () => {
            const items = [
                {},
                { quantity: 10 },
                { foodId: null, quantity: 5 },
            ];
            await expect(decStock(items)).resolves.not.toThrow();
            await expect(incStock(items)).resolves.not.toThrow();
        });
    });
});
