# E2E Testing - FoodFast

## 📋 Cấu trúc Test theo 6 Tiêu chí UX/UI

### 1️⃣ E2E User Journey (`01-user-journey.spec.js`)
- **Mục đích**: Kiểm tra luồng người dùng từ đầu đến cuối
- **Test cases**:
  - Xem menu và thêm sản phẩm vào giỏ
  - Đăng ký tài khoản mới
  - Đăng nhập → Thêm giỏ → Xem giỏ hàng
  - Xem giỏ hàng → Checkout
  - Xem đơn hàng của tôi

### 2️⃣ UX Form Validation (`02-form-validation.spec.js`)
- **Mục đích**: Kiểm tra trải nghiệm validate form
- **Test cases**:
  - Bỏ trống email và password
  - Email sai định dạng
  - Đăng ký thiếu tên
  - Password quá ngắn
  - Hiển thị lỗi khi đăng nhập sai

### 3️⃣ UI State Handling (`03-ui-state-handling.spec.js`)
- **Mục đích**: Xử lý các trạng thái UI
- **Test cases**:
  - Loading state khi tải trang
  - Empty state (giỏ hàng rỗng)
  - Error state (API lỗi)
  - Admin loading/empty states

### 4️⃣ Navigation Flow (`04-navigation-flow.spec.js`)
- **Mục đích**: Kiểm tra điều hướng
- **Test cases**:
  - Menu navigation (Trang chủ → Danh mục → Liên hệ)
  - Cart navigation và Back button
  - Redirect sau đăng nhập
  - Protected routes
  - Logo click → Home
  - Admin sidebar navigation

### 5️⃣ Error Message & Feedback (`05-error-feedback.spec.js`)
- **Mục đích**: Thông báo lỗi dễ hiểu, không technical
- **Test cases**:
  - Lỗi đăng nhập có thông báo rõ ràng
  - Validation message inline
  - Success feedback (thêm giỏ, đăng ký)
  - Admin error messages
  - 404 message thân thiện

### 6️⃣ UI Consistency (`06-ui-consistency.spec.js`)
- **Mục đích**: Nhất quán giao diện (không cần pixel-perfect)
- **Test cases**:
  - Brand colors nhất quán
  - Font family nhất quán
  - Button style nhất quán
  - Navbar style across pages
  - Icon sizes
  - Responsive consistency

---

## 🚀 Cách chạy tests

```bash
# Cài dependencies
cd e2e-tests
npm install

# Chạy tất cả tests
npx playwright test

# Chạy với UI mode (debug)
npx playwright test --ui

# Chạy 1 file cụ thể
npx playwright test tests/01-user-journey.spec.js

# Chạy với report
npx playwright test --reporter=html

# Xem report
npx playwright show-report
```

## ⚙️ Yêu cầu

1. **Backend** đang chạy tại `http://localhost:5000`
2. **Frontend** đang chạy tại `http://localhost:5173`
3. **Admin** đang chạy tại `http://localhost:5174`

Hoặc để Playwright tự start servers (đã config trong `playwright.config.js`).

---

## 📊 Kết quả mong đợi

| # | Tiêu chí | Số test | Mô tả |
|---|----------|---------|-------|
| 1 | User Journey | 5 | Luồng đặt hàng hoàn chỉnh |
| 2 | Form Validation | 5 | UX validate form |
| 3 | UI State Handling | 7 | Loading/Empty/Error |
| 4 | Navigation Flow | 9 | Điều hướng |
| 5 | Error Feedback | 6 | Thông báo lỗi |
| 6 | UI Consistency | 8 | Nhất quán UI |

**Tổng: ~40 test cases**
