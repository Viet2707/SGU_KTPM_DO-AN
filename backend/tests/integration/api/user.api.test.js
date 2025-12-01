import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import userModel from "../../../models/userModel.js";
import bcrypt from "bcrypt";

describe("User API - Integration Tests", () => {
    beforeEach(async () => {
        // Clean database before each test
        await userModel.deleteMany({});
    });

    describe("POST /api/user/register", () => {
        it("should register a new user successfully", async () => {
            const newUser = {
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            };

            const res = await request(app)
                .post("/api/user/register")
                .send(newUser);

            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();

            // Verify user was created in database
            const user = await userModel.findOne({ email: newUser.email });
            expect(user).toBeDefined();
            expect(user.name).toBe(newUser.name);
            expect(user.email).toBe(newUser.email);
        });

        it("should hash the password before storing", async () => {
            const newUser = {
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            };

            await request(app).post("/api/user/register").send(newUser);

            const user = await userModel.findOne({ email: newUser.email });
            expect(user.password).not.toBe(newUser.password);

            // Verify password is hashed correctly
            const isMatch = await bcrypt.compare(newUser.password, user.password);
            expect(isMatch).toBe(true);
        });

        it("should reject registration with existing email", async () => {
            const user = {
                name: "First User",
                email: "duplicate@example.com",
                password: "password123",
            };

            // Register first user
            await request(app).post("/api/user/register").send(user);

            // Try to register with same email
            const res = await request(app)
                .post("/api/user/register")
                .send({
                    name: "Second User",
                    email: "duplicate@example.com",
                    password: "password456",
                });

            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("already exists");
        });

        it("should reject registration with invalid email", async () => {
            const invalidUser = {
                name: "Test User",
                email: "invalid-email",
                password: "password123",
            };

            const res = await request(app)
                .post("/api/user/register")
                .send(invalidUser);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("valid email");
        });

        it("should reject registration with short password (< 8 chars)", async () => {
            const invalidUser = {
                name: "Test User",
                email: "test@example.com",
                password: "short",
            };

            const res = await request(app)
                .post("/api/user/register")
                .send(invalidUser);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("strong password");
        });

        it("should initialize user with default status 'unlock'", async () => {
            const newUser = {
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            };

            await request(app).post("/api/user/register").send(newUser);

            const user = await userModel.findOne({ email: newUser.email });
            expect(user.status).toBe("unlock");
        });

        it("should initialize user with empty cart", async () => {
            const newUser = {
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            };

            await request(app).post("/api/user/register").send(newUser);

            const user = await userModel.findOne({ email: newUser.email });
            expect(user.cartData).toEqual({});
        });
    });

    describe("POST /api/user/login", () => {
        const testUser = {
            name: "Test User",
            email: "test@example.com",
            password: "password123",
        };

        beforeEach(async () => {
            // Create a test user before each login test
            const hashedPassword = await bcrypt.hash(testUser.password, 10);
            await userModel.create({
                name: testUser.name,
                email: testUser.email,
                password: hashedPassword,
            });
        });

        it("should login successfully with correct credentials", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.message).toContain("thành công");
        });

        it("should reject login with non-existent email", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({
                    email: "nonexistent@example.com",
                    password: "password123",
                });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("không tồn tại");
        });

        it("should reject login with incorrect password", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({
                    email: testUser.email,
                    password: "wrongpassword",
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("Sai mật khẩu");
        });

        it("should reject login for locked user account", async () => {
            // Lock the user account
            await userModel.findOneAndUpdate(
                { email: testUser.email },
                { status: "lock" }
            );

            const res = await request(app)
                .post("/api/user/login")
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("bị khóa");
        });

        it("should return JWT token that can be verified", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(res.body.token).toBeDefined();
            expect(typeof res.body.token).toBe("string");
            expect(res.body.token.split(".")).toHaveLength(3); // JWT has 3 parts
        });

        it("should handle missing email field", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({ password: "password123" });

            expect(res.body.success).toBe(false);
        });

        it("should handle missing password field", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({ email: testUser.email });

            expect(res.body.success).toBe(false);
        });

        it("should handle empty request body", async () => {
            const res = await request(app).post("/api/user/login").send({});

            expect(res.body.success).toBe(false);
        });
    });

    describe("Edge Cases", () => {
        it("should handle very long email during registration", async () => {
            const longEmail = "a".repeat(100) + "@example.com";
            const res = await request(app)
                .post("/api/user/register")
                .send({
                    name: "Test User",
                    email: longEmail,
                    password: "password123",
                });

            // Should either accept or reject gracefully
            expect(res.body).toHaveProperty("success");
        });

        it("should handle special characters in name", async () => {
            const res = await request(app)
                .post("/api/user/register")
                .send({
                    name: "Nguyễn Văn A-B (Tester)",
                    email: "test@example.com",
                    password: "password123",
                });

            expect(res.body.success).toBe(true);
        });

        it("should handle SQL injection attempt in email", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({
                    email: "admin'--",
                    password: "password",
                });

            expect(res.body.success).toBe(false);
        });
    });
});
