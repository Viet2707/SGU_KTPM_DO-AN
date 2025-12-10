import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app.js"; // Assuming app.js exports the Express app
import userModel from "../../models/userModel.js"; // Adjust path as necessary

// Mock the console.log to prevent test output pollution during error tests
beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Cart Controller Integration Tests", () => {
  let userId;
  let authToken;
  const JWT_SECRET = "123"; // As per requirement

  beforeEach(async () => {
    // Arrange: Clean up database and create a test user
    await userModel.deleteMany({});

    const newUser = await userModel.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      cartData: {},
    });
    userId = newUser._id.toString();

    // Arrange: Generate a valid JWT token for authentication
    authToken = jwt.sign({ id: userId }, JWT_SECRET);
  });

  // --- addToCart Tests ---
  describe("POST /api/cart/add", () => {
    it("should add a new item to an empty cart successfully", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/add")
        .set("token", authToken)
        .send({ userId, itemId: "item123" });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Added To Cart",
      });

      const updatedUser = await userModel.findById(userId);
      expect(updatedUser.cartData["item123"]).toBe(1);
    });

    it("should increment quantity for an existing item in the cart successfully", async () => {
      // Arrange: Add item once first
      await userModel.findByIdAndUpdate(userId, {
        $set: { "cartData.item123": 1 },
      });

      // Act
      const response = await request(app)
        .post("/api/cart/add")
        .set("token", authToken)
        .send({ userId, itemId: "item123" });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Added To Cart",
      });

      const updatedUser = await userModel.findById(userId);
      expect(updatedUser.cartData["item123"]).toBe(2);
    });

    it("should add a new item when other items already exist in the cart", async () => {
      // Arrange: Add an initial item
      await userModel.findByIdAndUpdate(userId, {
        $set: { "cartData.item100": 1 },
      });

      // Act
      const response = await request(app)
        .post("/api/cart/add")
        .set("token", authToken)
        .send({ userId, itemId: "item123" });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Added To Cart",
      });

      const updatedUser = await userModel.findById(userId);
      expect(updatedUser.cartData["item100"]).toBe(1);
      expect(updatedUser.cartData["item123"]).toBe(1);
    });

    it("should return error if user does not exist", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/add")
        .set("token", authToken)
        .send({ userId: "60c72b2f9b1d8c001f8e4c70", itemId: "item123" }); // Non-existent user ID

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: false, message: "Error" });
      // The controller attempts to access cartData of a null user, leading to a caught error.
    });

    it("should return error if userId is missing from request body", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/add")
        .set("token", authToken)
        .send({ itemId: "item123" }); // Missing userId

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: false, message: "Error" });
      // Mongoose will throw a cast error or findOne will return null, leading to controller catch
    });

    it("should return error if itemId is missing from request body", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/add")
        .set("token", authToken)
        .send({ userId }); // Missing itemId

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: false, message: "Error" });
      // Accessing cartData[undefined] is fine, but findOne or findByIdAndUpdate might fail due to undefined item ID
      // The `cartData[req.body.itemId]` will result in `cartData[undefined] = 1`, which doesn't directly error,
      // but `findByIdAndUpdate` might not work as expected or the findOne might error. In this case, it will
      // attempt to update cartData with an undefined key.
    });

    it("should handle internal server errors during database operations", async () => {
      // Arrange: Mock findOne to throw an error
      const findOneSpy = vi
        .spyOn(userModel, "findOne")
        .mockRejectedValueOnce(new Error("Database connection lost"));

      // Act
      const response = await request(app)
        .post("/api/cart/add")
        .set("token", authToken)
        .send({ userId, itemId: "item123" });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: false, message: "Error" });
      expect(findOneSpy).toHaveBeenCalledWith({ _id: userId });
    });
  });

  // --- removeFromCart Tests ---
  describe("POST /api/cart/remove", () => {
    beforeEach(async () => {
      // Arrange: Populate cart for remove tests
      await userModel.findByIdAndUpdate(userId, {
        $set: { "cartData.item123": 2, "cartData.item456": 1 },
      });
    });

    it("should decrement quantity for an existing item successfully", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/remove")
        .set("token", authToken)
        .send({ userId, itemId: "item123" });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Removed From Cart",
      });

      const updatedUser = await userModel.findById(userId);
      expect(updatedUser.cartData["item123"]).toBe(1);
      expect(updatedUser.cartData["item456"]).toBe(1);
    });

    it("should decrement quantity to zero for an item that only had one", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/remove")
        .set("token", authToken)
        .send({ userId, itemId: "item456" });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Removed From Cart",
      });

      const updatedUser = await userModel.findById(userId);
      expect(updatedUser.cartData["item456"]).toBe(0); // Value becomes 0, key remains
      expect(updatedUser.cartData["item123"]).toBe(2);
    });

    it("should not decrement if item quantity is already zero or less", async () => {
      // Arrange: Set item123 to 0
      await userModel.findByIdAndUpdate(userId, {
        $set: { "cartData.item123": 0 },
      });

      // Act
      const response = await request(app)
        .post("/api/cart/remove")
        .set("token", authToken)
        .send({ userId, itemId: "item123" });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Removed From Cart",
      });

      const updatedUser = await userModel.findById(userId);
      expect(updatedUser.cartData["item123"]).toBe(0);
    });

    it("should not error if item is not in cart (quantity remains undefined)", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/remove")
        .set("token", authToken)
        .send({ userId, itemId: "nonExistentItem" });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Removed From Cart",
      });

      const updatedUser = await userModel.findById(userId);
      expect(updatedUser.cartData["nonExistentItem"]).toBeUndefined(); // Should not be added as 0
      expect(updatedUser.cartData["item123"]).toBe(2);
      expect(updatedUser.cartData["item456"]).toBe(1);
    });

    it("should return error if user does not exist", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/remove")
        .set("token", authToken)
        .send({ userId: "60c72b2f9b1d8c001f8e4c70", itemId: "item123" }); // Non-existent user ID

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: false, message: "Error" });
    });

    it("should return error if userId is missing from request body", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/remove")
        .set("token", authToken)
        .send({ itemId: "item123" }); // Missing userId

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: false, message: "Error" });
    });

    it("should return success even if itemId is missing, but no change in cart", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/remove")
        .set("token", authToken)
        .send({ userId }); // Missing itemId

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Removed From Cart",
      }); // The controller logic `cartData[req.body.itemId] -= 1` for undefined itemId is effectively a no-op if it's already undefined or 0, so it will succeed.
    });

    it("should handle internal server errors during database operations", async () => {
      // Arrange: Mock findById to throw an error
      const findByIdSpy = vi
        .spyOn(userModel, "findById")
        .mockRejectedValueOnce(new Error("Database query failed"));

      // Act
      const response = await request(app)
        .post("/api/cart/remove")
        .set("token", authToken)
        .send({ userId, itemId: "item123" });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: false, message: "Error" });
      expect(findByIdSpy).toHaveBeenCalledWith(userId);
    });
  });

  // --- getCart Tests ---
  describe("POST /api/cart/get", () => {
    it("should return cart data for a user with items successfully", async () => {
      // Arrange: Populate cart
      await userModel.findByIdAndUpdate(userId, {
        $set: { "cartData.itemA": 2, "cartData.itemB": 1 },
      });

      // Act
      const response = await request(app)
        .post("/api/cart/get")
        .set("token", authToken)
        .send({ userId });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        cartData: { itemA: 2, itemB: 1 },
      });
    });

    it("should return an empty cart for a user with no items", async () => {
      // Arrange: Ensure cart is empty (default from beforeEach) or explicitly set
      await userModel.findByIdAndUpdate(userId, { $set: { cartData: {} } });

      // Act
      const response = await request(app)
        .post("/api/cart/get")
        .set("token", authToken)
        .send({ userId });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: true, cartData: {} });
    });

    it("should return error if user does not exist", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/get")
        .set("token", authToken)
        .send({ userId: "60c72b2f9b1d8c001f8e4c70" }); // Non-existent user ID

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: false, message: "Error" });
    });

    it("should return error if userId is missing from request body", async () => {
      // Act
      const response = await request(app)
        .post("/api/cart/get")
        .set("token", authToken)
        .send({}); // Missing userId

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: false, message: "Error" });
    });

    it("should handle internal server errors during database operations", async () => {
      // Arrange: Mock findById to throw an error
      const findByIdSpy = vi
        .spyOn(userModel, "findById")
        .mockRejectedValueOnce(new Error("Database read error"));

      // Act
      const response = await request(app)
        .post("/api/cart/get")
        .set("token", authToken)
        .send({ userId });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: false, message: "Error" });
      expect(findByIdSpy).toHaveBeenCalledWith(userId);
    });
  });
});