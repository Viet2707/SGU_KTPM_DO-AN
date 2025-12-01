import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import userModel from "../../../models/userModel.js";

describe("User Model - Unit Tests", () => {
    beforeEach(async () => {
        // Clean up before each test
        await userModel.deleteMany({});
    });

    describe("Schema Validation", () => {
        it("should create a valid user with all required fields", async () => {
            const validUser = {
                name: "Test User",
                email: "test@example.com",
                password: "hashedpassword123",
            };

            const user = await userModel.create(validUser);
            expect(user.name).toBe(validUser.name);
            expect(user.email).toBe(validUser.email);
            expect(user.password).toBe(validUser.password);
            expect(user.status).toBe("unlock"); // default value
            expect(user.cartData).toEqual({}); // default value
        });

        it("should fail to create user without required name", async () => {
            const invalidUser = {
                email: "test@example.com",
                password: "hashedpassword123",
            };

            await expect(userModel.create(invalidUser)).rejects.toThrow();
        });

        it("should fail to create user without required email", async () => {
            const invalidUser = {
                name: "Test User",
                password: "hashedpassword123",
            };

            await expect(userModel.create(invalidUser)).rejects.toThrow();
        });

        it("should fail to create user without required password", async () => {
            const invalidUser = {
                name: "Test User",
                email: "test@example.com",
            };

            await expect(userModel.create(invalidUser)).rejects.toThrow();
        });

        it("should enforce unique email constraint", async () => {
            const user1 = {
                name: "User One",
                email: "duplicate@example.com",
                password: "password123",
            };

            await userModel.create(user1);

            const user2 = {
                name: "User Two",
                email: "duplicate@example.com", // same email
                password: "password456",
            };

            await expect(userModel.create(user2)).rejects.toThrow();
        });
    });

    describe("Status Field", () => {
        it("should default status to 'unlock'", async () => {
            const user = await userModel.create({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

            expect(user.status).toBe("unlock");
        });

        it("should accept 'lock' as valid status", async () => {
            const user = await userModel.create({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                status: "lock",
            });

            expect(user.status).toBe("lock");
        });

        it("should reject invalid status values", async () => {
            const invalidUser = {
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                status: "invalid_status",
            };

            await expect(userModel.create(invalidUser)).rejects.toThrow();
        });
    });

    describe("CartData Field", () => {
        it("should initialize cartData as empty object by default", async () => {
            const user = await userModel.create({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

            expect(user.cartData).toEqual({});
        });

        it("should allow custom cartData object", async () => {
            const cartData = {
                "item1": 2,
                "item2": 5,
            };

            const user = await userModel.create({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                cartData,
            });

            expect(user.cartData).toEqual(cartData);
        });
    });

    describe("Timestamps", () => {
        it("should set created_at timestamp automatically", async () => {
            const user = await userModel.create({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

            expect(user.created_at).toBeDefined();
            expect(user.created_at).toBeInstanceOf(Date);
        });
    });
});
