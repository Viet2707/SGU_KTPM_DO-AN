# 🍔 FoodFast - Ứng Dụng Đặt Đồ Ăn Trực Tuyến

Chào mừng đến với **FoodFast**, đồ án môn học **Kiểm Thử Phần Mềm** (KTPM) tại Đại học Sài Gòn (SGU). Đây là một hệ thống đặt đồ ăn hoàn chỉnh bao gồm Website cho khách hàng, Trang quản trị (Admin Panel) và Backend API mạnh mẽ.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech Stack](https://img.shields.io/badge/stack-MERN-blueviolet.svg)

---

## 📑 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng Chính](#-tính-năng-chính)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Cài Đặt & Chạy Dự Án](#-cài-đặt--chạy-dự-án)
- [Hướng Dẫn Kiểm Thử (Testing)](#-hướng-dẫn-kiểm-thử-testing)
- [API Documentation](#-api-documentation)
- [Tác Giả](#-tác-giả)

---

## 🚀 Giới Thiệu

**FoodFast** giải quyết bài toán đặt đồ ăn trực tuyến với trải nghiệm người dùng mượt mà và hệ thống quản lý chặt chẽ. Dự án tập trung vào việc áp dụng các quy trình kiểm thử phần mềm tự động (Automated Testing) từ Unit Test, Integration Test đến End-to-End (E2E) Test.

---

## ✨ Tính Năng Chính

### 👤 Khách Hàng (User Website)
- **Đăng ký/Đăng nhập:** Bảo mật với JWT.
- **Tìm kiếm & Duyệt món ăn:** Xem danh sách món ăn theo danh mục, lọc theo tiêu chí.
- **Giỏ hàng:** Thêm/Sửa/Xóa món ăn, tự động tính tổng tiền.
- **Đặt hàng:** Hỗ trợ thanh toán khi nhận hàng (COD).
- **Lịch sử đơn hàng:** Theo dõi trạng thái đơn hàng (Đang xử lý, Đang giao, Đã giao).

### 🛡️ Quản Trị Viên (Admin Panel)
- **Dashboard:** Xem thống kê tổng quan về đơn hàng, doanh thu.
- **Quản lý Món ăn:** Thêm, sửa, xóa món ăn, cập nhật hình ảnh và giá.
- **Quản lý Đơn hàng:** Cập nhật trạng thái đơn hàng (Processing -> Out for delivery -> Delivered).
- **Quản lý Kho hàng:** Tự động trừ kho khi có đơn hàng, hoàn kho khi hủy đơn.

### ⚙️ Hệ Thống
- **Xác thực & Phân quyền:** Middleware bảo vệ các API quan trọng.
- **Quản lý Kho:** Logic trừ kho nguyên tử (Atomic), ngăn chặn bán quá số lượng (Overselling).
- **Upload hình ảnh:** Lưu trữ hình ảnh món ăn.

---

## � Thiết Kế Hệ Thống

### 1. Conceptual Model (Mô hình Khái niệm)
Mô tả các thực thể chính và mối quan hệ giữa chúng trong hệ thống.
![Conceptual Model](docs/images/conceptual_model.png)

### 2. Conceptual ERD (Sơ đồ Thực thể - Quan hệ Khái niệm)
Chi tiết hóa các thuộc tính và quan hệ ở mức khái niệm.
![Conceptual ERD](docs/images/conceptual_erd.png)

### 3. Logical ERD (Sơ đồ Thực thể - Quan hệ Logic)
Mô hình dữ liệu chi tiết được ánh xạ sang MongoDB (NoSQL).
![Logical ERD](docs/images/logical_erd.png)

### 4. Kiến trúc Hệ thống (C4 Model)

#### C1 - System Context (Ngữ cảnh Hệ thống)
Tổng quan về sự tương tác giữa người dùng và hệ thống FoodFast.
![C4 System Context](docs/images/c4_system_context.png)

#### C2 - Container (Thành phần chứa)
Chi tiết các thành phần bên trong hệ thống: Web App, Admin Panel, API Backend, Database.
![C4 Container](docs/images/c4_container.png)

---

## �🛠 Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|------------|-----------|
| **Frontend** | ReactJS, Vite, CSS Modules |
| **Admin Panel** | ReactJS, Vite, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Testing** | Vitest (Backend), Playwright (E2E) |
| **Tools** | Postman, Git, VS Code |

---

## 📂 Cấu Trúc Dự Án

```bash
SGU_KTPM_DO-AN/
├── backend/                # Server Node.js & API
│   ├── controllers/        # Xử lý logic nghiệp vụ
│   ├── models/             # Schema MongoDB
│   ├── routes/             # Định nghĩa API endpoints
│   ├── tests/              # Unit & Integration Tests (Vitest)
│   └── ...
├── frontend/               # Website cho người dùng (React + Vite)
├── admin/                  # Trang quản trị (React + Vite)
├── e2e-tests/              # Kiểm thử tự động E2E (Playwright)
└── README.md               # Tài liệu dự án
```

---

## 💻 Cài Đặt & Chạy Dự Án

### Yêu cầu tiên quyết
- Node.js (v16 trở lên)
- MongoDB (Local hoặc Atlas)
- Git

### Bước 1: Clone dự án
```bash
git clone https://github.com/Viet2707/SGU_KTPM_DO-AN.git
cd SGU_KTPM_DO-AN
```

### Bước 2: Cài đặt & Chạy Backend
```bash
cd backend
npm install
# Tạo file .env và cấu hình biến môi trường (DB_URL, JWT_SECRET,...)
npm start
# Server chạy tại: http://localhost:5000
```

### Bước 3: Cài đặt & Chạy Admin Panel
```bash
cd ../admin
npm install
npm run dev
# Admin chạy tại: http://localhost:5174
```

### Bước 4: Cài đặt & Chạy Frontend
```bash
cd ../frontend
npm install
npm run dev
# Website chạy tại: http://localhost:5173
```

---

## 🧪 Hướng Dẫn Kiểm Thử (Testing)

Dự án áp dụng quy trình kiểm thử nghiêm ngặt với độ bao phủ cao.

### 1. Backend Testing (Unit & Integration)
Sử dụng **Vitest** để kiểm thử API và Logic nghiệp vụ.

- **Chạy tất cả test:**
  ```bash
  cd backend
  npm test
  ```
- **Xem báo cáo độ bao phủ (Coverage):**
  ```bash
  npm run test:coverage
  ```
  *(Kết quả sẽ được lưu trong thư mục `backend/coverage`)*

### 2. End-to-End Testing (E2E)
Sử dụng **Playwright** để kiểm thử luồng người dùng trên giao diện thực tế.

- **Chạy test tự động (Headless):**
  ```bash
  cd e2e-tests
  npm test
  ```
  *(Lệnh này sẽ tự động khởi động cả 3 server Frontend, Admin, Backend để test)*

- **Chạy test có giao diện (UI Mode):**
  ```bash
  npx playwright test --ui
  ```

- **Xem báo cáo E2E:**
  ```bash
  npx playwright show-report
  ```

---

## 📚 API Documentation

Hệ thống cung cấp các API chính sau:

- **Auth:** `/api/user/login`, `/api/user/register`
- **Food:** `/api/food/list`, `/api/food/add`, `/api/food/remove`
- **Cart:** `/api/cart/add`, `/api/cart/get`, `/api/cart/remove`
- **Order:** `/api/order/place`, `/api/order/userorders`, `/api/order/list`

*(Chi tiết xem trong thư mục `backend/routes` hoặc file Postman Collection kèm theo)*

---

## 👨‍💻 Tác Giả

**Sinh viên thực hiện:**
- **Họ tên:** [Tên của bạn]
- **Lớp:** [Lớp của bạn]
- **Trường:** Đại học Sài Gòn (SGU)

---

*Dự án được thực hiện cho mục đích học tập và nghiên cứu môn Kiểm Thử Phần Mềm.*
