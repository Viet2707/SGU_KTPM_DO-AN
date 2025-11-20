import { describe, it, expect, beforeEach, vi } from "vitest";
import { listFood, addFood, updateFood, removeFood } from "./foodController.js";
import Food from "../models/Food.js";
import Stock from "../models/Stock.js";

// ====== MOCK MODELS ======
vi.mock("../models/Food.js");
vi.mock("../models/Stock.js");

// ====== MOCK fs (chỉ cần rỗng vì không dùng fs trong test) ======
vi.mock("fs", () => ({
  unlink: vi.fn(),
}));

describe("Food Controller (Updated for MOW Garden)", () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { body: {}, params: {}, file: null };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
  });

  // ============================================================
  // LIST FOOD
  // ============================================================
  describe("listFood", () => {
    it("should return foods with stock and category name", async () => {
      const mockFoods = [
        {
          _id: "food1",
          name: "cây xanh",
          description: "desc",
          price: 100000,
          image: "img1.png",
          categoryId: { name: "Cây trang trí" },
        },
        {
          _id: "food2",
          name: "cây ẩm",
          description: "desc",
          price: 200000,
          image: "img2.png",
          categoryId: { name: "Cây văn phòng" },
        },
      ];

      Food.find.mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockFoods),
      });

      Stock.findOne.mockImplementation(({ foodId }) => {
        if (foodId === "food1") return Promise.resolve({ quantity: 10 });
        if (foodId === "food2") return Promise.resolve({ quantity: 5 });
        return Promise.resolve(null);
      });

      await listFood(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [
          expect.objectContaining({ quantity: 10 }),
          expect.objectContaining({ quantity: 5 }),
        ],
      });
    });
  });

  // ============================================================
  // ADD FOOD
  // ============================================================
  describe("addFood", () => {
    it("should create new food and stock", async () => {
      req.body = {
        name: "cây xanh",
        description: "desc",
        price: "250000",
        categoryId: "cate1",
      };
      req.file = { filename: "image.png" };

      Food.findOne.mockResolvedValue(null);

      const createdFood = {
        _id: "newfood",
        name: "cây xanh",
        description: "desc",
        price: 250000,
        categoryId: "cate1",
        image: "image.png",
      };

      Food.create.mockResolvedValue(createdFood);
      Stock.create.mockResolvedValue({});

      await addFood(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Đã thêm sản phẩm mới",
        food: createdFood,
      });
    });

    it("should return 400 if food already exists", async () => {
      req.body = { name: "cây xanh", categoryId: "cate1" };
      Food.findOne.mockResolvedValue({ _id: "exists" });

      await addFood(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ============================================================
  // UPDATE FOOD (SUCCESS + 404 ONLY)
  // ============================================================
  describe("updateFood", () => {
    it("should update food successfully", async () => {
      req.params.id = "food1";
      req.body = {
        name: "updated",
        description: "desc",
        price: "200000",
        categoryId: "cate1",
      };

      Food.findByIdAndUpdate.mockReturnValue({
        populate: vi.fn().mockResolvedValue({
          _id: "food1",
          name: "updated",
          description: "desc",
          price: 200000,
          image: "img.png",
          categoryId: { name: "Cây trang trí" },
        }),
      });

      await updateFood(req, res);

      expect(res.json).toHaveBeenCalled();
    });

    it("should return 404 if food not found", async () => {
      req.params.id = "food404";
      req.body = {
        name: "x",
        description: "y",
        price: "100000",
        categoryId: "cate1",
      };

      Food.findByIdAndUpdate.mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      });

      await updateFood(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ============================================================
  // REMOVE FOOD (ONLY 404 TEST)
  // ============================================================
  describe("removeFood", () => {
    it("should return 404 if not found", async () => {
      req.body.id = "none";
      Food.findById.mockResolvedValue(null);

      await removeFood(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
