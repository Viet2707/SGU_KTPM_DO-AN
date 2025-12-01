import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import orderModel from "../../../models/orderModel.js";
import userModel from "../../../models/userModel.js";
import Food from "../../../models/Food.js";
import Stock from "../../../models/Stock.js";
import Category from "../../../models/Category.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Order API - Integration Tests", () => {
    let userToken;
    let userId;
    let testFood1, testFood2;
    let testCategory;

    beforeEach(async () => {
        // Clean database
        await orderModel.deleteMany({});
        await userModel.deleteMany({});
        await Food.deleteMany({});
        await Stock.deleteMany({});
        await Category.deleteMany({});

        // Create test user
        const hashedPassword = await bcrypt.hash("password123", 10);
        const user = await userModel.create({
            name: "Test User",
            email: "user@test.com",
            password: hashedPassword,
        });

        userId = user._id.toString();
        userToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "123"
        );

        // Create test category and foods with stock
        testCategory = await Category.create({ name: "Test Category" });

        testFood1 = await Food.create({
            name: "Pizza",
            price: 100,
            categoryId: testCategory._id,
        });

        testFood2 = await Food.create({
            name: "Burger",
            price: 50,
            categoryId: testCategory._id,
        });

        // Create stock
        await Stock.create({ foodId: testFood1._id, quantity: 10 });
        await Stock.create({ foodId: testFood2._id, quantity: 5 });
    });

    describe("POST /api/order/place - Place Order (COD)", () => {
        it("should place order successfully with sufficient stock", async () => {
            const orderData = {
                userId,
                items: [
                    { foodId: testFood1._id, name: "Pizza", quantity: 2, price: 100 },
                    { foodId: testFood2._id, name: "Burger", quantity: 1, price: 50 },
                ],
                amount: 250,
                address: {
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@example.com",
                    street: "123 Main St",
                    city: "HCMC",
                    zipCode: "70000",
                    phone: "0123456789",
                },
            };

            const res = await request(app)
                .post("/api/order/place")
                .set("token", userToken)
                .send(orderData);

            expect(res.body.success).toBe(true);
            expect(res.body.orderId).toBeDefined();
            expect(res.body.message).toContain("Đặt hàng thành công");

            // Verify order was created
            const order = await orderModel.findById(res.body.orderId);
            expect(order).toBeDefined();
            expect(order.userId).toBe(userId);
            expect(order.status).toBe("Food Processing");
            expect(order.payment).toBe(false);
            expect(order.paymentMethod).toBe("COD");
        });

        it("should decrease stock quantity after placing order", async () => {
            const orderData = {
                userId,
                items: [
                    { foodId: testFood1._id, name: "Pizza", quantity: 3, price: 100 },
                ],
                amount: 300,
                address: { street: "123 Main St" },
            };

            await request(app)
                .post("/api/order/place")
                .set("token", userToken)
                .send(orderData);

            // Check stock was decreased
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(7); // 10 - 3 = 7
        });

        it("should clear user cart after order is placed", async () => {
            // Set user cart
            await userModel.findByIdAndUpdate(userId, {
                cartData: { [testFood1._id]: 2, [testFood2._id]: 1 },
            });

            const orderData = {
                userId,
                items: [
                    { foodId: testFood1._id, name: "Pizza", quantity: 2, price: 100 },
                ],
                amount: 200,
                address: { street: "123 Main St" },
            };

            await request(app)
                .post("/api/order/place")
                .set("token", userToken)
                .send(orderData);

            // Verify cart is empty
            const user = await userModel.findById(userId);
            expect(user.cartData).toEqual({});
        });

        it("should reject order when stock is insufficient", async () => {
            const orderData = {
                userId,
                items: [
                    { foodId: testFood1._id, name: "Pizza", quantity: 20, price: 100 }, // Only 10 in stock
                ],
                amount: 2000,
                address: { street: "123 Main St" },
            };

            const res = await request(app)
                .post("/api/order/place")
                .set("token", userToken)
                .send(orderData);

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("không đủ tồn kho");

            // Verify stock was NOT decreased
            const stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(10);
        });

        it("should reject order with empty items array", async () => {
            const orderData = {
                userId,
                items: [],
                amount: 0,
                address: { street: "123 Main St" },
            };

            const res = await request(app)
                .post("/api/order/place")
                .set("token", userToken)
                .send(orderData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("Thiếu danh sách sản phẩm");
        });

        it("should reject order without items field", async () => {
            const orderData = {
                userId,
                amount: 100,
                address: { street: "123 Main St" },
            };

            const res = await request(app)
                .post("/api/order/place")
                .set("token", userToken)
                .send(orderData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("GET /api/order/list - List All Orders (Admin)", () => {
        it("should return all orders", async () => {
            // Create test orders
            await orderModel.create({
                userId,
                items: [{ foodId: testFood1._id, quantity: 2 }],
                amount: 200,
                address: { street: "123 Main St" },
            });

            await orderModel.create({
                userId,
                items: [{ foodId: testFood2._id, quantity: 1 }],
                amount: 50,
                address: { street: "456 Second St" },
            });

            const res = await request(app).get("/api/order/list");

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(2);
        });

        it("should return orders sorted by date (newest first)", async () => {
            const order1 = await orderModel.create({
                userId,
                items: [{ foodId: testFood1._id, quantity: 1 }],
                amount: 100,
                address: { street: "123 Main St" },
                date: new Date("2024-01-01"),
            });

            const order2 = await orderModel.create({
                userId,
                items: [{ foodId: testFood2._id, quantity: 1 }],
                amount: 50,
                address: { street: "456 Second St" },
                date: new Date("2024-01-02"),
            });

            const res = await request(app).get("/api/order/list");

            expect(res.body.data[0]._id.toString()).toBe(order2._id.toString());
            expect(res.body.data[1]._id.toString()).toBe(order1._id.toString());
        });
    });

    describe("POST /api/order/userorders - Get User Orders", () => {
        it("should return only orders for the authenticated user", async () => {
            // Create other user
            const otherUser = await userModel.create({
                name: "Other User",
                email: "other@test.com",
                password: "password123",
            });

            // Create orders for both users
            await orderModel.create({
                userId,
                items: [{ foodId: testFood1._id, quantity: 1 }],
                amount: 100,
                address: { street: "123 Main St" },
            });

            await orderModel.create({
                userId: otherUser._id.toString(),
                items: [{ foodId: testFood2._id, quantity: 1 }],
                amount: 50,
                address: { street: "456 Second St" },
            });

            const res = await request(app)
                .post("/api/order/userorders")
                .set("token", userToken)
                .send({ userId });

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].userId).toBe(userId);
        });

        it("should return empty array if user has no orders", async () => {
            const res = await request(app)
                .post("/api/order/userorders")
                .set("token", userToken)
                .send({ userId });

            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });
    });

    describe("POST /api/order/status - Update Order Status", () => {
        let testOrder;

        beforeEach(async () => {
            testOrder = await orderModel.create({
                userId,
                items: [{ foodId: testFood1._id, name: "Pizza", quantity: 2, price: 100 }],
                amount: 200,
                address: { street: "123 Main St" },
            });

            // Decrease stock as if order was placed
            await Stock.findOneAndUpdate(
                { foodId: testFood1._id },
                { $inc: { quantity: -2 } }
            );
        });

        it("should update order status to 'Out for delivery'", async () => {
            const res = await request(app)
                .post("/api/order/status")
                .send({
                    orderId: testOrder._id.toString(),
                    status: "Out for delivery",
                });

            expect(res.body.success).toBe(true);

            const order = await orderModel.findById(testOrder._id);
            expect(order.status).toBe("Out for delivery");
        });

        it("should mark payment as true when status is Delivered", async () => {
            const res = await request(app)
                .post("/api/order/status")
                .send({
                    orderId: testOrder._id.toString(),
                    status: "Delivered",
                });

            expect(res.body.success).toBe(true);

            const order = await orderModel.findById(testOrder._id);
            expect(order.status).toBe("Delivered");
            expect(order.payment).toBe(true);
            expect(order.paidAt).toBeDefined();
        });

        it("should restore stock when order is Canceled", async () => {
            const stockBefore = await Stock.findOne({ foodId: testFood1._id });
            const quantityBefore = stockBefore.quantity;

            const res = await request(app)
                .post("/api/order/status")
                .send({
                    orderId: testOrder._id.toString(),
                    status: "Canceled",
                });

            expect(res.body.success).toBe(true);

            const stockAfter = await Stock.findOne({ foodId: testFood1._id });
            expect(stockAfter.quantity).toBe(quantityBefore + 2); // Restored 2 items
        });

        it("should NOT allow status change from Delivered", async () => {
            // Set order to Delivered
            await orderModel.findByIdAndUpdate(testOrder._id, {
                status: "Delivered",
                payment: true,
            });

            const res = await request(app)
                .post("/api/order/status")
                .send({
                    orderId: testOrder._id.toString(),
                    status: "Out for delivery",
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("đã chốt");
        });

        it("should NOT allow status change from Canceled", async () => {
            // Set order to Canceled
            await orderModel.findByIdAndUpdate(testOrder._id, {
                status: "Canceled",
            });

            const res = await request(app)
                .post("/api/order/status")
                .send({
                    orderId: testOrder._id.toString(),
                    status: "Delivered",
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 for non-existent order", async () => {
            const mongoose = await import("mongoose");
            const fakeId = new mongoose.default.Types.ObjectId();

            const res = await request(app)
                .post("/api/order/status")
                .send({
                    orderId: fakeId.toString(),
                    status: "Delivered",
                });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("should NOT restore stock twice when canceling already canceled order", async () => {
            // Cancel order first time
            await request(app)
                .post("/api/order/status")
                .send({
                    orderId: testOrder._id.toString(),
                    status: "Canceled",
                });

            const stockAfterFirstCancel = await Stock.findOne({ foodId: testFood1._id });

            // Try to cancel again (should be blocked by status check)
            await request(app)
                .post("/api/order/status")
                .send({
                    orderId: testOrder._id.toString(),
                    status: "Canceled",
                });

            const stockAfterSecondCancel = await Stock.findOne({ foodId: testFood1._id });
            expect(stockAfterSecondCancel.quantity).toBe(stockAfterFirstCancel.quantity);
        });
    });

    describe("GET /api/order/:id - Get Order By ID", () => {
        it("should return order details", async () => {
            const order = await orderModel.create({
                userId,
                items: [{ foodId: testFood1._id, name: "Pizza", quantity: 2, price: 100 }],
                amount: 200,
                address: { street: "123 Main St" },
            });

            const res = await request(app).get(`/api/order/${order._id}`);

            expect(res.body.success).toBe(true);
            expect(res.body.data._id.toString()).toBe(order._id.toString());
            expect(res.body.data.items).toHaveLength(1);
        });

        it("should return 404 for non-existent order", async () => {
            const mongoose = await import("mongoose");
            const fakeId = new mongoose.default.Types.ObjectId();

            const res = await request(app).get(`/api/order/${fakeId}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe("Order Workflow - Complete Lifecycle", () => {
        it("should handle complete order lifecycle: Place → Out for delivery → Delivered", async () => {
            // 1. Place order
            const placeRes = await request(app)
                .post("/api/order/place")
                .set("token", userToken)
                .send({
                    userId,
                    items: [{ foodId: testFood1._id, name: "Pizza", quantity: 2, price: 100 }],
                    amount: 200,
                    address: { street: "123 Main St" },
                });

            const orderId = placeRes.body.orderId;
            expect(placeRes.body.success).toBe(true);

            // 2. Update to "Out for delivery"
            await request(app)
                .post("/api/order/status")
                .send({ orderId, status: "Out for delivery" });

            let order = await orderModel.findById(orderId);
            expect(order.status).toBe("Out for delivery");
            expect(order.payment).toBe(false);

            // 3. Update to "Delivered"
            await request(app)
                .post("/api/order/status")
                .send({ orderId, status: "Delivered" });

            order = await orderModel.findById(orderId);
            expect(order.status).toBe("Delivered");
            expect(order.payment).toBe(true);
            expect(order.paidAt).toBeDefined();
        });

        it("should handle canceled order workflow with stock restoration", async () => {
            const stockBefore = await Stock.findOne({ foodId: testFood1._id });

            // 1. Place order
            const placeRes = await request(app)
                .post("/api/order/place")
                .set("token", userToken)
                .send({
                    userId,
                    items: [{ foodId: testFood1._id, name: "Pizza", quantity: 3, price: 100 }],
                    amount: 300,
                    address: { street: "123 Main St" },
                });

            const orderId = placeRes.body.orderId;

            // Stock should be decreased
            let stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(stockBefore.quantity - 3);

            // 2. Cancel order
            await request(app)
                .post("/api/order/status")
                .send({ orderId, status: "Canceled" });

            // Stock should be restored
            stock = await Stock.findOne({ foodId: testFood1._id });
            expect(stock.quantity).toBe(stockBefore.quantity);

            const order = await orderModel.findById(orderId);
            expect(order.payment).toBe(false);
        });
    });
});
