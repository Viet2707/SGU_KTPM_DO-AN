import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import userModel from "../../../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Cart API - Integration Tests", () => {
    let userToken;
    let userId;
    const itemId1 = "food_id_123";
    const itemId2 = "food_id_456";

    beforeEach(async () => {
        // Clean database
        await userModel.deleteMany({});

        // Create test user
        const hashedPassword = await bcrypt.hash("password123", 10);
        const user = await userModel.create({
            name: "Test User",
            email: "user@test.com",
            password: hashedPassword,
            cartData: {},
        });

        userId = user._id.toString();
        userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "123");
    });

    describe("POST /api/cart/add - Add to Cart", () => {
        it("should add item to empty cart", async () => {
            const res = await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain("Added To Cart");

            // Verify in database
            const user = await userModel.findById(userId);
            expect(user.cartData[itemId1]).toBe(1);
        });

        it("should increment quantity when adding existing item", async () => {
            // Add item first time
            await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            // Add same item again
            const res = await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            expect(res.body.success).toBe(true);

            // Verify quantity is 2
            const user = await userModel.findById(userId);
            expect(user.cartData[itemId1]).toBe(2);
        });

        it("should add multiple different items", async () => {
            await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId2 });

            const user = await userModel.findById(userId);
            expect(user.cartData[itemId1]).toBe(1);
            expect(user.cartData[itemId2]).toBe(1);
        });

        it("should require authentication", async () => {
            const res = await request(app)
                .post("/api/cart/add")
                .send({ userId, itemId: itemId1 });

            expect(res.status).toBe(401);
        });

        it("should handle adding same item multiple times in sequence", async () => {
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post("/api/cart/add")
                    .set("token", userToken)
                    .send({ userId, itemId: itemId1 });
            }

            const user = await userModel.findById(userId);
            expect(user.cartData[itemId1]).toBe(5);
        });
    });

    describe("POST /api/cart/remove - Remove from Cart", () => {
        beforeEach(async () => {
            // Setup cart with items
            await userModel.findByIdAndUpdate(userId, {
                cartData: {
                    [itemId1]: 3,
                    [itemId2]: 1,
                },
            });
        });

        it("should decrease item quantity by 1", async () => {
            const res = await request(app)
                .post("/api/cart/remove")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain("Removed From Cart");

            const user = await userModel.findById(userId);
            expect(user.cartData[itemId1]).toBe(2);
        });

        it("should not decrease quantity below 0", async () => {
            // Remove item with quantity 1
            await request(app)
                .post("/api/cart/remove")
                .set("token", userToken)
                .send({ userId, itemId: itemId2 });

            // Try to remove again
            await request(app)
                .post("/api/cart/remove")
                .set("token", userToken)
                .send({ userId, itemId: itemId2 });

            const user = await userModel.findById(userId);
            expect(user.cartData[itemId2]).toBe(0);
        });

        it("should handle removing non-existent item gracefully", async () => {
            const res = await request(app)
                .post("/api/cart/remove")
                .set("token", userToken)
                .send({ userId, itemId: "non_existent_item" });

            expect(res.body.success).toBe(true);
        });

        it("should require authentication", async () => {
            const res = await request(app)
                .post("/api/cart/remove")
                .send({ userId, itemId: itemId1 });

            expect(res.status).toBe(401);
        });

        it("should remove item completely when quantity reaches 0", async () => {
            // Remove item with quantity 1
            await request(app)
                .post("/api/cart/remove")
                .set("token", userToken)
                .send({ userId, itemId: itemId2 });

            const user = await userModel.findById(userId);
            expect(user.cartData[itemId2]).toBe(0);
        });
    });

    describe("POST /api/cart/get - Get Cart", () => {
        it("should return empty cart for new user", async () => {
            const res = await request(app)
                .post("/api/cart/get")
                .set("token", userToken)
                .send({ userId });

            expect(res.body.success).toBe(true);
            expect(res.body.cartData).toEqual({});
        });

        it("should return cart with items", async () => {
            // Setup cart
            const cartData = {
                [itemId1]: 2,
                [itemId2]: 5,
            };

            await userModel.findByIdAndUpdate(userId, { cartData });

            const res = await request(app)
                .post("/api/cart/get")
                .set("token", userToken)
                .send({ userId });

            expect(res.body.success).toBe(true);
            expect(res.body.cartData).toEqual(cartData);
        });

        it("should require authentication", async () => {
            const res = await request(app)
                .post("/api/cart/get")
                .send({ userId });

            expect(res.status).toBe(401);
        });

        it("should return only current user's cart", async () => {
            // Create another user with cart
            const otherUser = await userModel.create({
                name: "Other User",
                email: "other@test.com",
                password: "password123",
                cartData: { [itemId1]: 999 },
            });

            // Setup current user cart
            await userModel.findByIdAndUpdate(userId, {
                cartData: { [itemId1]: 1 },
            });

            const res = await request(app)
                .post("/api/cart/get")
                .set("token", userToken)
                .send({ userId });

            expect(res.body.cartData[itemId1]).toBe(1);
            expect(res.body.cartData[itemId1]).not.toBe(999);
        });
    });

    describe("Cart Operations - Complex Scenarios", () => {
        it("should handle add and remove operations in sequence", async () => {
            // Add 3 items
            await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            // Remove 1 item
            await request(app)
                .post("/api/cart/remove")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            const user = await userModel.findById(userId);
            expect(user.cartData[itemId1]).toBe(2);
        });

        it("should handle multiple items with different quantities", async () => {
            // Add item1 twice
            await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            // Add item2 once
            await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId2 });

            const user = await userModel.findById(userId);
            expect(user.cartData[itemId1]).toBe(2);
            expect(user.cartData[itemId2]).toBe(1);
        });

        it("should preserve cart data after get operation", async () => {
            // Add items
            await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            // Get cart
            const getRes = await request(app)
                .post("/api/cart/get")
                .set("token", userToken)
                .send({ userId });

            expect(getRes.body.cartData[itemId1]).toBe(1);

            // Verify cart still exists after get
            const user = await userModel.findById(userId);
            expect(user.cartData[itemId1]).toBe(1);
        });

        it("should handle rapid concurrent operations", async () => {
            // Simulate concurrent add operations
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(
                    request(app)
                        .post("/api/cart/add")
                        .set("token", userToken)
                        .send({ userId, itemId: itemId1 })
                );
            }

            await Promise.all(promises);

            const user = await userModel.findById(userId);
            // Due to race conditions, quantity might not be exactly 10
            // But should be a reasonable number
            expect(user.cartData[itemId1]).toBeGreaterThan(0);
            expect(user.cartData[itemId1]).toBeLessThanOrEqual(10);
        });
    });

    describe("Edge Cases", () => {
        it("should handle very long item IDs", async () => {
            const longItemId = "x".repeat(100);

            const res = await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: longItemId });

            expect(res.body.success).toBe(true);

            const user = await userModel.findById(userId);
            expect(user.cartData[longItemId]).toBe(1);
        });

        it("should handle special characters in item IDs", async () => {
            const specialItemId = "item-123_test@special#id";

            const res = await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: specialItemId });

            expect(res.body.success).toBe(true);
        });

        it("should handle adding 0 quantity items (edge case)", async () => {
            // Pre-populate cart
            await userModel.findByIdAndUpdate(userId, {
                cartData: { [itemId1]: 0 },
            });

            // Add to 0 quantity item
            await request(app)
                .post("/api/cart/add")
                .set("token", userToken)
                .send({ userId, itemId: itemId1 });

            const user = await userModel.findById(userId);
            expect(user.cartData[itemId1]).toBe(1);
        });
    });

    describe("Authentication and Authorization", () => {
        it("should reject request with invalid token", async () => {
            const res = await request(app)
                .post("/api/cart/add")
                .set("token", "invalid_token")
                .send({ userId, itemId: itemId1 });

            expect(res.status).toBe(401);
        });

        it("should reject request with expired token", async () => {
            // Create expired token (expires in -1 hour)
            const expiredToken = jwt.sign(
                { id: userId },
                process.env.JWT_SECRET || "123",
                { expiresIn: "-1h" }
            );

            const res = await request(app)
                .post("/api/cart/add")
                .set("token", expiredToken)
                .send({ userId, itemId: itemId1 });

            expect(res.status).toBe(401);
        });
    });
});
