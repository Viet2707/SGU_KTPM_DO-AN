import { describe, it, expect, beforeEach, vi } from "vitest";
import authMiddleware from "../../../middleware/auth.js";
import userModel from "../../../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

describe("Auth Middleware - Unit Tests", () => {
    let req, res, next;
    let testUser;

    beforeEach(async () => {
        // Clean database
        await userModel.deleteMany({});

        // Create test user
        const hashedPassword = await bcrypt.hash("password123", 10);
        testUser = await userModel.create({
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword,
            status: "unlock",
        });

        // Mock request, response, next
        req = {
            headers: {},
            body: {},
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        next = vi.fn();
    });

    describe("Token Validation", () => {
        it("should pass authentication with valid token", async () => {
            const token = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET || "123"
            );

            req.headers.token = token;

            await authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.body.userId).toBeDefined();
            expect(req.body.userId.toString()).toBe(testUser._id.toString());
            expect(req.user).toBeDefined();
        });

        it("should accept token from Authorization header with Bearer prefix", async () => {
            const token = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET || "123"
            );

            req.headers.authorization = `Bearer ${token}`;

            await authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.body.userId.toString()).toBe(testUser._id.toString());
        });

        it("should reject request without token", async () => {
            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining("Không có token"),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it("should reject request with invalid token", async () => {
            req.headers.token = "invalid_token_string";

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining("không hợp lệ"),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it("should reject request with expired token", async () => {
            const expiredToken = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET || "123",
                { expiresIn: "-1h" }
            );

            req.headers.token = expiredToken;

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it("should reject token for non-existent user", async () => {
            const fakeUserId = new (await import("mongoose")).default.Types.ObjectId();
            const token = jwt.sign({ id: fakeUserId }, process.env.JWT_SECRET || "123");

            req.headers.token = token;

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining("Không tìm thấy"),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("User Status Check", () => {
        it("should reject locked user account", async () => {
            // Lock the user
            await userModel.findByIdAndUpdate(testUser._id, { status: "lock" });

            const token = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET || "123"
            );

            req.headers.token = token;

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining("bị khóa"),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it("should allow unlocked user to proceed", async () => {
            const token = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET || "123"
            );

            req.headers.token = token;

            await authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe("Request Enhancement", () => {
        it("should add user object to request", async () => {
            const token = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET || "123"
            );

            req.headers.token = token;

            await authMiddleware(req, res, next);

            expect(req.user).toBeDefined();
            expect(req.user._id.toString()).toBe(testUser._id.toString());
            expect(req.user.email).toBe(testUser.email);
            expect(req.user.name).toBe(testUser.name);
        });

        it("should add userId to request body", async () => {
            const token = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET || "123"
            );

            req.headers.token = token;
            req.body = { someData: "test" };

            await authMiddleware(req, res, next);

            expect(req.body.userId).toBeDefined();
            expect(req.body.userId.toString()).toBe(testUser._id.toString());
            expect(req.body.someData).toBe("test"); // Original data preserved
        });
    });

    describe("Token Formats", () => {
        it("should handle token without Bearer prefix", async () => {
            const token = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET || "123"
            );

            req.headers.token = token;

            await authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it("should handle malformed Authorization header", async () => {
            req.headers.authorization = "InvalidFormat token123";

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it("should prioritize token header over authorization header", async () => {
            const validToken = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET || "123"
            );

            req.headers.token = validToken;
            req.headers.authorization = "Bearer invalid_token";

            await authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe("Error Handling", () => {
        it("should handle database errors gracefully", async () => {
            const token = jwt.sign(
                { id: "invalid_object_id" },
                process.env.JWT_SECRET || "123"
            );

            req.headers.token = token;

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it("should handle missing JWT_SECRET", async () => {
            const originalSecret = process.env.JWT_SECRET;
            delete process.env.JWT_SECRET;

            const token = jwt.sign({ id: testUser._id }, "123");

            req.headers.token = token;

            await authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();

            // Restore
            process.env.JWT_SECRET = originalSecret;
        });
    });

    describe("Security", () => {
        it("should not expose sensitive user data in error messages", async () => {
            req.headers.token = "malicious_token";

            await authMiddleware(req, res, next);

            expect(res.json).toHaveBeenCalled();
            const errorResponse = res.json.mock.calls[0][0];
            expect(errorResponse.message).not.toContain("password");
            expect(errorResponse.message).not.toContain("hash");
        });

        it("should validate token signature", async () => {
            // Token signed with wrong secret
            const wrongToken = jwt.sign({ id: testUser._id }, "wrong_secret");

            req.headers.token = wrongToken;

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
