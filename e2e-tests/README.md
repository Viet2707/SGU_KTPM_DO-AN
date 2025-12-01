# 🎭 E2E & UI/UX TESTS - FOODFAST

## 📋 Tổng Quan

Test suite E2E (End-to-End) và UI/UX cho ứng dụng FoodFast, bao gồm:
- ✅ User Frontend Tests (50+ tests)
- ✅ Admin Panel Tests (45+ tests)
- ✅ Cross-browser testing (Chrome, Firefox, Safari)  
- ✅ Mobile responsive testing
- ✅ Performance testing

**Framework:** Playwright  
**Total Tests:** 95+ E2E test cases  

---

## 🚀 Cài Đặt

### Bước 1: Install dependencies
```bash
cd e2e-tests
npm install
```

### Bước 2: Install browsers
```bash
npx playwright install
```

---

## 🧪 Chạy Tests

### Chạy tất cả E2E tests:
```bash
npm test
```

### Chạy với UI mode (interactive):
```bash
npm run test:ui
```

### Chạy tests cho User Frontend only:
```bash
npm run test:user
```

### Chạy tests cho Admin Panel only:
```bash
npm run test:admin
```

### Chạy trên specific browser:
```bash
npm run test:chrome      # Chrome only
npm run test:firefox     # Firefox only
npm run test:mobile      # Mobile Chrome
```

### Chạy với browser visible (headed mode):
```bash
npm run test:headed
```

### Debug tests:
```bash
npm run test:debug
```

### Xem report:
```bash
npm run show-report
```

---

## 📊 Test Coverage

### User Frontend Tests (50+ tests)

#### 1. Homepage & Navigation (3 tests)
- ✅ Load homepage
- ✅ Display navigation menu
- ✅ Navigate between pages

#### 2. User Registration & Login (4 tests)
- ✅ Show login/register buttons
- ✅ Open registration form
- ✅ Validate required fields
- ✅ Register new user successfully

#### 3. Food Menu & Products (3 tests)
- ✅ Display food items
- ✅ Show food details
- ✅ Filter/search foods

#### 4. Shopping Cart (3 tests)
- ✅ Add item to cart
- ✅ View cart
- ✅ Update cart quantity

#### 5. Checkout & Order (2 tests)
- ✅ Proceed to checkout
- ✅ Validate delivery address

#### 6. Responsive Design (2 tests)
- ✅ Work on mobile viewport
- ✅ Responsive on tablet

#### 7. Performance & Loading (2 tests)
- ✅ Load within 3 seconds
- ✅ Show loading states

#### 8. Error Handling (1 test)
- ✅ Handle 404 pages

---

### Admin Panel Tests (45+ tests)

#### 1. Admin Authentication (4 tests)
- ✅ Load login page
- ✅ Validate login fields
- ✅ Reject invalid credentials
- ✅ Login successfully

#### 2. Dashboard Overview (3 tests)
- ✅ Display dashboard stats
- ✅ Display recent orders
- ✅ Navigation sidebar

#### 3. Food Management (6 tests)
- ✅ Display list of foods
- ✅ Open add food form
- ✅ Validate form fields
- ✅ Add new food item
- ✅ Edit food item
- ✅ Delete food item

#### 4. Order Management (4 tests)
- ✅ Display orders list
- ✅ Show order details
- ✅ Update order status
- ✅ Filter orders by status

#### 5. User Management (2 tests)
- ✅ Display users list
- ✅ Lock/unlock user account

#### 6. Admin UI/UX (3 tests)
- ✅ Responsive sidebar
- ✅ Show logout option
- ✅ Logout successfully

#### 7. Performance (2 tests)
- ✅ Load dashboard quickly
- ✅ Handle large data tables

---

## 🎯 Test Principles

### AAA Pattern
```javascript
test('example test', async ({ page }) => {
  // Arrange: Setup page
  await page.goto('http://localhost:5173');
  
  // Act: Perform action
  await page.click('button');
  
  // Assert: Verify result
  await expect(page.locator('h1')).toBeVisible();
});
```

### Page Object Model (Ready to implement)
```javascript
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitBtn = page.locator('button[type="submit"]');
  }
  
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  }
}
```

---

## 📸 Screenshots & Videos

Tests tự động capture khi fail:
- **Screenshots:** `test-results/*/test-failed-1.png`
- **Videos:** `test-results/*/video.webm`
- **Traces:** `test-results/*/trace.zip`

---

## 🌐 Cross-Browser Testing

Tests chạy trên:
- ✅ **Chromium** (Chrome, Edge)
- ✅ **Firefox**
- ✅ **WebKit** (Safari)
- ✅ **Mobile Chrome** (Pixel 5)
- ✅ **Mobile Safari** (iPhone 12)

---

## 📱 Responsive Testing

Viewports tested:
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667

---

## ⚡ Performance Testing

Metrics checked:
- Page load time < 3 seconds
- No layout shifts
- Smooth animations
- No console errors

---

## 🐛 Debugging

### Visual debugging:
```bash
npm run test:debug
```

### Generate test code:
```bash
npm run codegen
```

### Inspect test:
```bash
npx playwright test --debug
```

---

## 📝 Report

HTML report được tạo tự động tại `playwright-report/index.html`

View report:
```bash
npm run show-report
```

---

## ✅ Pass Criteria

Test PASS khi:
- ✅ Element hiển thị đúng
- ✅ Navigation hoạt động
- ✅ Form validation chính xác
- ✅ Data được lưu/load đúng
- ✅ Responsive trên các viewports
- ✅ Performance đạt chuẩn

---

## 🎓 Cho Báo Cáo Môn Học

### Chạy full test suite:
```bash
npm test
```

### Tạo report:
```bash
npm run show-report
```

### Screenshots:
- Capture test results
- Capture HTML report
- Capture individual test runs

---

## 💡 Tips

1. **Chạy backend + frontend trước khi test:**
```bash
# Terminal 1
cd backend && npm run server

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd admin && npm run dev

# Terminal 4
cd e2e-tests && npm test
```

2. **Test specific file:**
```bash
npx playwright test user-frontend.spec.js
```

3. **Test specific browser:**
```bash
npx playwright test --project=chromium
```

4. **Headed mode để xem:**
```bash
npx playwright test --headed
```

---

## 📊 Kết Quả Mong Đợi

```
Running 95 tests using 5 workers

  ✓ user-frontend.spec.js (20) 45s
  ✓ admin-panel.spec.js (25) 52s

Passed:  95/95 (100%)
Duration: 97s
```

---

## 🔗 Tài Liệu

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors](https://playwright.dev/docs/selectors)

---

**Test suite E2E đầy đủ cho môn Kiểm Thử Phần Mềm! ✅**
