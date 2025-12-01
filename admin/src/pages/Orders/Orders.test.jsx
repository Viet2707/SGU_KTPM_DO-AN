/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { toast } from "react-toastify";
import Orders from "./Orders";

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock global assets
jest.mock("../../assets/assets", () => ({
  assets: { parcel_icon: "parcel.png" },
  url: "http://localhost:5000",
  currency: "đ",
}));

let mockAxios = new MockAdapter(axios);

describe("Order Component - Unit Test", () => {
  beforeEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
  });

  // ================================
  // 1) TEST FETCH ALL ORDERS
  // ================================
  test("fetchAllOrders — load & display orders", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/order/list")
      .reply(200, {
        success: true,
        data: [
          {
            _id: "abc123",
            status: "Food Processing",
            amount: 50000,
            payment: true,
            items: [{ name: "Cà phê", quantity: 2, price: 25000 }],
            address: { firstName: "A", lastName: "B", email: "ab@mail.com" },
          },
        ],
      });

    await act(async () => {
      render(<Orders />);
    });

    expect(await screen.findByText(/Đơn #\s*abc123/)).toBeInTheDocument();
    expect(screen.getByText("1 món")).toBeInTheDocument();
    expect(screen.getByText("Đã thanh toán")).toBeInTheDocument();
  });

  test("fetchAllOrders — show error toast if API returns fail", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/order/list")
      .reply(200, { success: false, message: "Lỗi rồi" });

    await act(async () => {
      render(<Orders />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Lỗi rồi");
    });
  });

  test("fetchAllOrders — show network error toast", async () => {
    mockAxios.onGet("http://localhost:5000/api/order/list").networkError();

    await act(async () => {
      render(<Orders />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Lỗi tải danh sách đơn hàng");
    });
  });

  // ====================================
  // 2) TEST STATUS HANDLER
  // ====================================
  test("statusHandler — update success + reload orders", async () => {
    // Step 1: initial load
    mockAxios
      .onGet("http://localhost:5000/api/order/list")
      .reply(200, {
        success: true,
        data: [
          {
            _id: "111",
            status: "Food Processing",
            amount: 20000,
            items: [{ name: "Phở", quantity: 1, price: 20000 }],
            address: {},
          },
        ],
      });

    // Step 2: updating order status
    mockAxios
      .onPost("http://localhost:5000/api/order/status")
      .reply(200, { success: true });

    await act(async () => {
      render(<Orders />);
    });

    // Ensure initial order is loaded
    expect(await screen.findByText(/Đơn #\s*111/)).toBeInTheDocument();

    // Simulate changing status
    const select = screen.getByDisplayValue("Food Processing");

    await act(async () => {
      fireEvent.change(select, { target: { value: "Delivered" } });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Cập nhật trạng thái thành công");
    });
  });

  test("statusHandler — update fail", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/order/list")
      .reply(200, {
        success: true,
        data: [
          {
            _id: "111",
            status: "Food Processing",
            amount: 20000,
            items: [{ name: "Phở", quantity: 1, price: 20000 }],
            address: {},
          },
        ],
      });

    mockAxios
      .onPost("http://localhost:5000/api/order/status")
      .reply(200, { success: false, message: "Sai dữ liệu" });

    await act(async () => {
      render(<Orders />);
    });

    const select = screen.getByRole("combobox");
    await act(async () => {
      fireEvent.change(select, { target: { value: "Delivered" } });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Sai dữ liệu");
    });
  });

  test("statusHandler — network error", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/order/list")
      .reply(200, {
        success: true,
        data: [
          {
            _id: "111",
            status: "Food Processing",
            amount: 20000,
            items: [{ name: "Phở", quantity: 1, price: 20000 }],
            address: {},
          },
        ],
      });

    mockAxios
      .onPost("http://localhost:5000/api/order/status")
      .networkError();

    await act(async () => {
      render(<Orders />);
    });

    const select = screen.getByRole("combobox");
    await act(async () => {
      fireEvent.change(select, { target: { value: "Delivered" } });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ================================
  // 3) UI TEST
  // ================================
  test("UI — show empty state when no orders", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/order/list")
      .reply(200, { success: true, data: [] });

    await act(async () => {
      render(<Orders />);
    });

    expect(await screen.findByText("Chưa có đơn hàng nào.")).toBeInTheDocument();
  });

  test("UI — disable select when status = delivered/canceled", async () => {
    mockAxios
      .onGet("http://localhost:5000/api/order/list")
      .reply(200, {
        success: true,
        data: [
          {
            _id: "222",
            status: "Delivered",
            items: [],
            amount: 10000,
            address: {},
          },
        ],
      });

    await act(async () => {
      render(<Orders />);
    });

    const select = await screen.findByDisplayValue("Delivered");
    expect(select).toBeDisabled();
  });
});