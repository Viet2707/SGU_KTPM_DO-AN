# 🍔 FoodFast - Ứng Dụng Giao Đồ Ăn & Bộ Kiểm Thử Tự Động

![Node.js](https://img.shields.io/badge/Node.js-18.x-green) ![React](https://img.shields.io/badge/React-18.x-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Latest-forestgreen) ![Vitest](https://img.shields.io/badge/Testing-Vitest-yellow) ![Playwright](https://img.shields.io/badge/E2E-Playwright-orange)

> **Môn học:** Kiểm Thử Phần Mềm - SGU  
> **Đồ án:** Xây dựng hệ thống Food Delivery và Bộ Test Suite tự động hóa toàn diện.

---

## 📚 Tổng Quan

**FoodFast** là một ứng dụng giao đồ ăn Full-stack được xây dựng để phục vụ nhu cầu đặt món trực tuyến nhanh chóng và tiện lợi. Điểm đặc biệt của dự án này không chỉ nằm ở tính năng ứng dụng mà còn ở hệ thống **Kiểm Thử Tự Động (Automated Testing)** mạnh mẽ, bao phủ từ Unit Test, Integration Test đến End-to-End (E2E) Test, đảm bảo chất lượng phần mềm ở mức cao nhất.

Dự án tích hợp **AI (Google Gemini)** để hỗ trợ sinh test case tự động, tối ưu hóa quy trình kiểm thử.

<!-- TODO: Chèn ảnh chụp màn hình trang chủ hoặc dashboard của ứng dụng tại đây -->
![Giao diện FoodFast](./assets/dashboard-screenshot.png)

---

## 📁 Mục Lục

- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cài Đặt Môi Trường](#-cài-đặt-môi-trường)
- [Hướng Dẫn Chạy Ứng Dụng](#-hướng-dẫn-chạy-ứng-dụng)
- [Hệ Thống Kiểm Thử](#-hệ-thống-kiểm-thử)
- [Kết Quả & Báo Cáo](#-kết-quả--báo-cáo)
- [Tính Năng Chính](#-tính-năng-chính)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)

---

## 🛠 Công Nghệ Sử Dụng

### 1. Backend Service
- **Runtime:** Node.js
- **Framework:** Express.js
- **Cơ sở dữ liệu:** MongoDB (Mongoose ODM)
- **Xác thực:** JWT, Bcrypt
- **Thanh toán:** Tích hợp Stripe
- **Kiểm thử:** Vitest, Supertest

### 2. Frontend Application
- **Framework:** React.js (Vite)
- **Giao diện:** CSS3, Responsive Design
- **Quản lý State/Routing:** React Router, Context API
- **Kiểm thử:** Playwright (E2E)

### 3. Công cụ AI & Tự động hóa
- **Engine:** Google Generative AI (Gemini)
- **Tool:** Custom AI Test Generator CLI (Công cụ sinh test tự động)

---

## ⚙️ Cài Đặt Môi Trường

### Yêu cầu tiên quyết
- Node.js (v18 trở lên)
- MongoDB (đang chạy local hoặc Atlas URL)
- Git

### 1. Sao chép dự án (Clone)
```bash
git clone <repository_url>
cd SGU_KTPM_DO-AN
```

### 2. Cài đặt các gói phụ thuộc (Dependencies)

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` trong thư mục `backend` với nội dung mẫu:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/food-del
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
GEMINI_API_KEY=your_gemini_key # Dành cho AI Test Generator
```

---

## 🚀 Hướng Dẫn Chạy Ứng Dụng

Để chạy toàn bộ hệ thống, bạn cần khởi động cả Backend và Frontend.

### Bước 1: Khởi động Backend
```bash
cd backend
npm start
# Server sẽ chạy tại http://localhost:4000
```

### Bước 2: Khởi động Frontend
```bash
cd frontend
npm run dev
# Ứng dụng sẽ chạy tại http://localhost:5173
```

### Bước 3: Admin Panel (Tùy chọn)
```bash
cd admin
npm install
npm run dev
```

---

## 🧪 Hệ Thống Kiểm Thử

Đây là phần lõi của đồ án này. Hệ thống test được chia làm 3 tầng chính:

### 1. Backend Tests (Vitest)
Bao gồm Unit Tests cho Models và Integration Tests cho các APIs.

```bash
cd backend

# Chạy toàn bộ test
npm test

# Chạy test theo nhóm
npm run test:models   # Kiểm tra Database Schema
npm run test:api      # Kiểm tra các API Endpoints
npm run test:coverage # Xem báo cáo độ bao phủ code
```

### 2. UI/UX E2E Tests (Playwright)
Kiểm thử luồng người dùng thực tế trên trình duyệt Chromium.

```bash
cd e2e-tests

# Cài đặt browser (chạy lần đầu)
npx playwright install

# Chạy E2E Tests
npx playwright test

# Xem báo cáo HTML
npx playwright show-report
```

### 3. Sinh Test Bằng AI (AI-Powered Test Gen)
Sử dụng Google Gemini để tự động tạo test case cho các controllers.

```bash
cd backend
npm run ai:generate      # Menu tương tác CLI
npm run ai:generate:all  # Tự động tạo test cho tất cả
```

---

## 📊 Kết Quả & Báo Cáo

Dựa trên [Báo Cáo Tổng Kết Final](./BAO-CAO-TONG-KET-FINAL.md):

| Bộ Test (Test Suite) | Độ Bao Phủ (Coverage) | Trạng Thái |
|----------------------|-----------------------|------------|
| **Backend Models** | 96% | ✅ Xuất sắc |
| **Backend API** | ~77% | ✅ Tốt |
| **Middleware** | 100% | ✅ Hoàn hảo |
| **E2E UI/UX** | 71% | ⚠️ Ổn định |

<!-- TODO: Chèn ảnh chụp kết quả chạy test (terminal hoặc HTML report) tại đây -->
![Báo cáo kết quả test](./assets/test-report_screenshot.png)

---

## ✨ Tính Năng Chính

### Client (Người dùng)
- 🔐 **Xác thực:** Đăng nhập, Đăng ký, Quên mật khẩu.
- 🛍️ **Mua sắm:** Duyệt món ăn, Tìm kiếm, Thêm vào giỏ hàng.
- 💳 **Thanh toán:** Đặt hàng, Thanh toán qua Stripe hoặc COD.
- 📦 **Đơn hàng:** Theo dõi trạng thái đơn hàng (Đang xử lý -> Đã giao).

### Admin Dashboard (Quản trị)
- ➕ **Quản lý món ăn:** Thêm, Sửa, Xóa món ăn.
- 📋 **Quản lý đơn hàng:** Cập nhật trạng thái và xem đơn hàng.

---

## 📂 Cấu Trúc Dự Án

```
SGU_KTPM_DO-AN/
├── backend/                # Server & Logic xử lý API
│   ├── models/             # Định nghĩa Database Schemas
│   ├── controllers/        # Logic nghiệp vụ
│   ├── routes/             # Định tuyến API
│   ├── tests/              # Bộ test Vitest
│   └── ai-tools/           # Script sinh test bằng AI
├── frontend/               # Giao diện người dùng (React)
├── admin/                  # Giao diện quản trị (Admin)
├── e2e-tests/              # Bộ test E2E với Playwright
└── BAO-CAO-TONG-KET-FINAL.md # Báo cáo chi tiết đồ án
```

---

## 👨‍💻 Tác Giả

**Sinh viên thực hiện:** [Tên Của Bạn]  
**MSSV:** [Mã Số Sinh Viên]  
**Lớp:** [Lớp Học]  
**Trường:** Đại học Sài Gòn (SGU)

---

Phát triển với ❤️ cho môn học Kiểm Thử Phần Mềm.
