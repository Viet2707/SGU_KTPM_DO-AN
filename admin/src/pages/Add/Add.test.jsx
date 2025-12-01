/**
 * @jest-environment jsdom
 */
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import Add from "./Add";
import { toast } from "react-toastify";

// Mock toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock assets
jest.mock("../../assets/assets", () => ({
  assets: { upload_area: "upload.png" },
  url: "http://localhost:5000",
}));

// Mock URL.createObjectURL
beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => "mock-image-url");
});

let mockAxios = new MockAdapter(axios);

describe("Add Component – Unit Test", () => {
  beforeEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
  });

  // ============================================================
  // 1) FETCH CATEGORY
  // ============================================================
  test("Fetch categories on mount – success", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/category/list")
      .reply(200, {
        success: true,
        categories: [
          { _id: "111", name: "Trà Sữa" },
          { _id: "222", name: "Cà Phê" },
        ],
      });

    render(<Add />);

    expect(
      await screen.findByText("Trà Sữa")
    ).toBeInTheDocument();
    expect(screen.getByText("Cà Phê")).toBeInTheDocument();
  });

  test("Fetch categories – fail", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/category/list")
      .reply(200, { success: false });

    render(<Add />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Không lấy được danh mục");
    });
  });

  test("Fetch categories – network error", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/category/list")
      .networkError();

    render(<Add />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Lỗi khi load danh mục");
    });
  });

  // ============================================================
  // 2) SUBMIT FORM
  // ============================================================
  test("Submit fail when no image", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/category/list")
      .reply(200, { success: true, categories: [] });

    render(<Add />);

    fireEvent.submit(screen.getByRole("form"));

    expect(toast.error).toHaveBeenCalledWith("Chưa chọn ảnh");
  });

  test("Submit food – success", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/category/list")
      .reply(200, { success: true, categories: [] });

    mockAxios
      .onPost("http://localhost:5000/api/food/add")
      .reply(200, { success: true, message: "OK" });

    render(<Add />);

    // Fill form
    const fakeImage = new File(["aaa"], "food.png", { type: "image/png" });
    const inputFile = screen.getByLabelText("Upload image").parentNode.querySelector("input");

    fireEvent.change(inputFile, { target: { files: [fakeImage] } });

    fireEvent.change(screen.getByPlaceholderText("Nhập tên sản phẩm"), {
      target: { name: "name", value: "Trà sữa" },
    });

    fireEvent.change(screen.getByPlaceholderText("Nhập mô tả sản phẩm"), {
      target: { name: "description", value: "Ngon" },
    });

    fireEvent.change(screen.getByPlaceholderText("Nhập giá (VND)"), {
      target: { name: "price", value: "30000" },
    });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { name: "categoryId", value: "999" },
    });

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("OK");
    });
  });

  test("Submit food – API returns fail", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/category/list")
      .reply(200, { success: true, categories: [] });

    mockAxios
      .onPost("http://localhost:5000/api/food/add")
      .reply(200, { success: false, message: "Sai dữ liệu" });

    render(<Add />);

    // Add fake image
    const fakeImg = new File(["aaa"], "pic.png", { type: "image/png" });
    const inputFile = screen.getByLabelText("Upload image").parentNode.querySelector("input");

    fireEvent.change(inputFile, { target: { files: [fakeImg] } });

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Sai dữ liệu");
    });
  });

  test("Submit food – network error", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/category/list")
      .reply(200, { success: true, categories: [] });

    mockAxios.onPost("http://localhost:5000/api/food/add").networkError();

    render(<Add />);

    const fakeImg = new File(["aaa"], "pic.png", { type: "image/png" });
    const inputFile = screen.getByLabelText("Upload image").parentNode.querySelector("input");

    fireEvent.change(inputFile, { target: { files: [fakeImg] } });

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Thêm sản phẩm thất bại");
    });
  });

  // ============================================================
  // 3) INPUT CHANGE
  // ============================================================
  test("onChangeHandler updates state", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/category/list")
      .reply(200, { success: true, categories: [] });

    render(<Add />);

    const input = screen.getByPlaceholderText("Nhập tên sản phẩm");

    fireEvent.change(input, { target: { name: "name", value: "Bánh mì" } });

    expect(input.value).toBe("Bánh mì");
  });

  // ============================================================
  // 4) UPLOAD IMAGE
  // ============================================================
  test("Upload image works", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/category/list")
      .reply(200, { success: true, categories: [] });

    render(<Add />);

    const fakeImage = new File(["bbb"], "a.png", { type: "image/png" });
    const inputFile = screen.getByLabelText("Upload image").parentNode.querySelector("input");

    fireEvent.change(inputFile, { target: { files: [fakeImage] } });

    expect(inputFile.files[0]).toBe(fakeImage);
  });
});