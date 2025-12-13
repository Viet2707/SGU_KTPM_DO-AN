import { describe, it, expect, beforeEach } from "vitest";
import orderModel from "../../../models/orderModel.js";

describe("Order Model - Unit Tests", () => {
    beforeEach(async () => {
        await orderModel.deleteMany({});
    });

    describe("Schema Validation", () => {
        it("should create a valid order with all required fields", async () => {
            const validOrder = {
                userId: "user123",
                items: [
                    { foodId: "food1", name: "Pizza", quantity: 2, price: 100 },
                    { foodId: "food2", name: "Burger", quantity: 1, price: 50 },
                ],
                amount: 250,
                address: {
                    street: "123 Main St",
                    city: "Ho Chi Minh",
                    zipCode: "70000",
                },
            };

            const order = await orderModel.create(validOrder);
            expect(order.userId).toBe(validOrder.userId);
            expect(order.items).toHaveLength(2);
            expect(order.amount).toBe(validOrder.amount);
            expect(order.address.street).toBe(validOrder.address.street);
        });

        it("should fail to create order without userId", async () => {
            const invalidOrder = {
                items: [{ foodId: "food1", quantity: 2 }],
                amount: 100,
                address: { street: "123 Main St" },
            };

            await expect(orderModel.create(invalidOrder)).rejects.toThrow();
        });

        it("should fail to create order without items", async () => {
            const invalidOrder = {
                userId: "user123",
                amount: 100,
                address: { street: "123 Main St" },
            };

            await expect(orderModel.create(invalidOrder)).rejects.toThrow();
        });

        it("should fail to create order without amount", async () => {
            const invalidOrder = {
                userId: "user123",
                items: [{ foodId: "food1", quantity: 2 }],
                address: { street: "123 Main St" },
            };

            await expect(orderModel.create(invalidOrder)).rejects.toThrow();
        });

        it("should fail to create order without address", async () => {
            const invalidOrder = {
                userId: "user123",
                items: [{ foodId: "food1", quantity: 2 }],
                amount: 100,
            };

            await expect(orderModel.create(invalidOrder)).rejects.toThrow();
        });
    });

    describe("Default Values", () => {
        it("should set default status to 'Food Processing'", async () => {
            const order = await orderModel.create({
                userId: "user123",
                items: [{ foodId: "food1", quantity: 2 }],
                amount: 100,
                address: { street: "123 Main St" },
            });

            expect(order.status).toBe("Food Processing");
        });

        it("should set default paymentMethod to 'COD'", async () => {
            const order = await orderModel.create({
                userId: "user123",
                items: [{ foodId: "food1", quantity: 2 }],
                amount: 100,
                address: { street: "123 Main St" },
            });

            expect(order.paymentMethod).toBe("COD");
        });

        it("should set default payment to false", async () => {
            const order = await orderModel.create({
                userId: "user123",
                items: [{ foodId: "food1", quantity: 2 }],
                amount: 100,
                address: { street: "123 Main St" },
            });

            expect(order.payment).toBe(false);
        });

        it("should set default date to current date", async () => {
            const beforeCreate = new Date();
            // Add small delay to avoid timing issues
            await new Promise(resolve => setTimeout(resolve, 10));
            
            const order = await orderModel.create({
                userId: "user123",
                items: [{ foodId: "food1", quantity: 2 }],
                amount: 100,
                address: { street: "123 Main St" },
            });
            
            const afterCreate = new Date();

            expect(order.date).toBeDefined();
            // Use more lenient timing check (allow 1 second difference)
            const timeDiff = Math.abs(order.date.getTime() - beforeCreate.getTime());
            expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
        });
    });

    describe("Payment Fields", () => {
        it("should allow setting payment to true", async () => {
            const order = await orderModel.create({
                userId: "user123",
                items: [{ foodId: "food1", quantity: 2 }],
                amount: 100,
                address: { street: "123 Main St" },
                payment: true,
            });

            expect(order.payment).toBe(true);
        });

        it("should allow setting paidAt timestamp", async () => {
            const paidAt = new Date();
            const order = await orderModel.create({
                userId: "user123",
                items: [{ foodId: "food1", quantity: 2 }],
                amount: 100,
                address: { street: "123 Main St" },
                payment: true,
                paidAt,
            });

            expect(order.paidAt).toBeDefined();
            expect(order.paidAt.toISOString()).toBe(paidAt.toISOString());
        });
    });

    describe("Status Field", () => {
        const possibleStatuses = [
            "Food Processing",
            "Out for delivery",
            "Delivered",
            "Canceled",
        ];

        possibleStatuses.forEach((status) => {
            it(`should allow status "${status}"`, async () => {
                const order = await orderModel.create({
                    userId: "user123",
                    items: [{ foodId: "food1", quantity: 2 }],
                    amount: 100,
                    address: { street: "123 Main St" },
                    status,
                });

                expect(order.status).toBe(status);
            });
        });

        it("should allow custom status values", async () => {
            const order = await orderModel.create({
                userId: "user123",
                items: [{ foodId: "food1", quantity: 2 }],
                amount: 100,
                address: { street: "123 Main St" },
                status: "Custom Status",
            });

            expect(order.status).toBe("Custom Status");
        });
    });

    describe("Items Array", () => {
        it("should store multiple items with different properties", async () => {
            const items = [
                { foodId: "food1", name: "Pizza", quantity: 2, price: 100 },
                { foodId: "food2", name: "Burger", quantity: 1, price: 50 },
                { foodId: "food3", name: "Salad", quantity: 3, price: 30 },
            ];

            const order = await orderModel.create({
                userId: "user123",
                items,
                amount: 340,
                address: { street: "123 Main St" },
            });

            expect(order.items).toHaveLength(3);
            expect(order.items[0].name).toBe("Pizza");
            expect(order.items[1].quantity).toBe(1);
            expect(order.items[2].price).toBe(30);
        });

        it("should accept empty items array (though not recommended)", async () => {
            const order = await orderModel.create({
                userId: "user123",
                items: [],
                amount: 0,
                address: { street: "123 Main St" },
            });

            expect(order.items).toHaveLength(0);
        });
    });

    describe("Address Object", () => {
        it("should store complex address object", async () => {
            const address = {
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                street: "123 Main St",
                city: "Ho Chi Minh",
                state: "HCMC",
                zipCode: "70000",
                country: "Vietnam",
                phone: "0123456789",
            };

            const order = await orderModel.create({
                userId: "user123",
                items: [{ foodId: "food1", quantity: 1 }],
                amount: 100,
                address,
            });

            expect(order.address.firstName).toBe("John");
            expect(order.address.email).toBe("john@example.com");
            expect(order.address.phone).toBe("0123456789");
        });
    });

    describe("Amount Validation", () => {
        it("should accept positive amount", async () => {
            const order = await orderModel.create({
                userId: "user123",
                items: [{ foodId: "food1", quantity: 1 }],
                amount: 1000,
                address: { street: "123 Main St" },
            });

            expect(order.amount).toBe(1000);
        });

        it("should accept decimal amount", async () => {
            const order = await orderModel.create({
                userId: "user123",
                items: [{ foodId: "food1", quantity: 1 }],
                amount: 99.99,
                address: { street: "123 Main St" },
            });

            expect(order.amount).toBe(99.99);
        });
    });
});
