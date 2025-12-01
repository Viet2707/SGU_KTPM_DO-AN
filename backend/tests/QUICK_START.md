# 🚀 Quick Start Guide - Running Tests

## Bước 1: Cài Đặt Dependencies
```bash
cd backend
npm install
```

## Bước 2: Thiết Lập Environment
Tạo file `.env` nếu chưa có:
```env
MONGODB_URI=mongodb://localhost:27017/foodfast
MONGODB_URI_TEST=mongodb://localhost:27017/foodfast-test
JWT_SECRET=your_secret_key_here
```

## Bước 3: Đảm Bảo MongoDB Đang Chạy
```bash
# Windows: Khởi động MongoDB service
net start MongoDB

# Hoặc chạy mongod manually
mongod
```

## Bước 4: Chạy Tests

### Chạy TẤT CẢ tests:
```bash
npm test
```

### Chạy UNIT tests only:
```bash
npm run test:unit
```

### Chạy INTEGRATION tests only:
```bash
npm run test:integration
```

### Chạy tests cho MODELS only:
```bash
npm run test:models
```

### Chạy tests cho API endpoints only:
```bash
npm run test:api
```

### Chạy tests trong WATCH mode (auto-rerun):
```bash
npm run test:watch
```

### Chạy specific test file:
```bash
npm test tests/unit/models/user.model.test.js
```

## Bước 5: Xem Kết Quả

Output sẽ hiển thị:
- ✅ Passed tests (màu xanh)
- ❌ Failed tests (màu đỏ)
- ⏭️  Skipped tests (màu vàng)

```
✓ tests/unit/models/user.model.test.js (10)
✓ tests/unit/models/food.model.test.js (12)
✓ tests/integration/api/user.api.test.js (20)
...

Test Files  9 passed (9)
     Tests  185 passed (185)
  Start at  00:30:45
  Duration  15.23s
```

---

## 📊 Test Structure Overview

```
tests/
├── README.md                          # Hướng dẫn chi tiết
├── TEST_SUMMARY.md                    # Tổng kết test suite
├── QUICK_START.md                     # File này
├── setup.js                           # Global setup
│
├── unit/                              # Unit Tests
│   ├── models/                        # Model tests
│   │   ├── user.model.test.js        # 10 tests
│   │   ├── food.model.test.js        # 12 tests
│   │   └── order.model.test.js       # 15 tests
│   │
│   ├── middleware/                    # Middleware tests
│   │   └── auth.middleware.test.js   # 16 tests
│   │
│   └── business-logic/                # Logic tests
│       └── stock.logic.test.js       # 22 tests
│
└── integration/                       # Integration Tests
    └── api/                           # API tests
        ├── user.api.test.js          # 20 tests
        ├── food.api.test.js          # 22 tests
        ├── order.api.test.js         # 28 tests
        └── cart.api.test.js          # 20 tests
```

---

## 🐛 Troubleshooting

### Problem 1: "Cannot connect to MongoDB"
**Solution:**
```bash
# Kiểm tra MongoDB đang chạy
mongod --version

# Khởi động MongoDB
net start MongoDB

# Hoặc
mongod --dbpath "C:\data\db"
```

### Problem 2: "JWT_SECRET is not defined"
**Solution:**
Thêm vào `.env`:
```env
JWT_SECRET=your_secret_123
```

### Problem 3: Tests fail với "Timeout"
**Solution:**
Tăng timeout trong `vitest.config.js`:
```javascript
export default defineConfig({
  test: {
    testTimeout: 30000, // 30 seconds
  },
});
```

### Problem 4: "Port already in use"
**Solution:**
Tests không cần server chạy. Đừng chạy `npm run server` khi test.

---

## ✅ Quick Check Commands

### Kiểm tra tất cả tests có chạy được:
```bash
npm test
```

### Kiểm tra một test file cụ thể:
```bash
npm test tests/unit/models/user.model.test.js
```

### Xem chi tiết output:
```bash
npm test -- --reporter=verbose
```

### Chạy tests với retry (nếu fail):
```bash
npm test -- --retry=3
```

---

## 📈 Expected Results

✅ **All tests should PASS:**
- Unit Tests: ~75 tests
- Integration Tests: ~90 tests  
- Total: ~185 tests

⏱️ **Duration:** 10-20 seconds (tùy máy)

💾 **Database:** Test database sẽ tự động clean sau mỗi run

---

## 🎯 Next Steps

1. ✅ Đọc `README.md` để hiểu chi tiết test suite
2. ✅ Đọc `TEST_SUMMARY.md` để xem coverage
3. ✅ Chạy `npm test` để verify
4. ✅ Explore từng test file để học patterns
5. ✅ Thêm tests mới khi thêm features

---

## 💡 Tips

- Sử dụng `test:watch` khi develop để tests tự chạy
- Chạy `test:models` hoặc `test:api` khi chỉ cần test một phần
- Đọc error messages cẩn thận - chúng rất descriptive
- Tests được viết rõ ràng - dùng làm documentation

---

**Happy Testing! 🎉**

Nếu có vấn đề, check:
1. MongoDB có đang chạy không?
2. `.env` đã setup chưa?
3. `npm install` đã chạy chưa?
4. Đọc error message và check troubleshooting section
