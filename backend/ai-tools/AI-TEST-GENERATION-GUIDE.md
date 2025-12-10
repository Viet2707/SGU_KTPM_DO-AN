# 🤖 AI-Powered Test Generation - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

Hệ thống tự động sinh test cases cho backend controllers sử dụng **Google Gemini AI**. 

**Tính năng:**
- ✅ Tự động phân tích controller code
- ✅ Sinh test cases toàn diện (success, error, edge cases)
- ✅ Format theo Vitest + Supertest
- ✅ Hoàn toàn miễn phí với Google Gemini
- ✅ CLI tool dễ sử dụng

---

## 🚀 Setup

### Bước 1: Cài đặt dependencies

```bash
cd backend
npm install
```

Package được cài: `@google/generative-ai`

### Bước 2: Kiểm tra API Key

File `.env` đã được cấu hình với Gemini API key:

```env
GEMINI_API_KEY=AIzaSy...
```

✅ **Đã sẵn sàng sử dụng!**

---

## 💻 Cách Sử Dụng

### Generate test cho 1 controller

```bash
# Cách 1: Dùng npm script
npm run ai:generate -- --controller userController

# Cách 2: Chạy trực tiếp
node ai-tools/generate-tests-cli.js --controller userController
```

**Output:**
- File test được tạo tại: `tests/ai-generated/userController.ai.test.js`
- Console hiển thị số lượng functions được cover

### Preview trước khi save

```bash
npm run ai:generate -- --controller foodController --preview
```

Sẽ hiển thị code trên console mà không lưu file.

### Generate test cho TẤT CẢ controllers

```bash
npm run ai:generate:all
```

Sẽ tự động:
1. Tìm tất cả files `*Controller.js` trong `controllers/`
2. Generate test cho từng controller
3. Hiển thị progress và kết quả

---

## 📂 Cấu Trúc Files

```
backend/
├── ai-tools/
│   ├── ai-test-generator.js      # Core AI generator
│   └── generate-tests-cli.js     # CLI tool
├── controllers/
│   ├── userController.js         # Source controllers
│   ├── foodController.js
│   └── ...
├── tests/
│   ├── ai-generated/             # AI-generated tests (NEW)
│   │   ├── userController.ai.test.js
│   │   ├── foodController.ai.test.js
│   │   └── ...
│   ├── integration/              # Manual tests
│   └── unit/
└── .env                          # Contains GEMINI_API_KEY
```

---

## 🧪 Chạy Generated Tests

### Test 1 file

```bash
npm test tests/ai-generated/userController.ai.test.js
```

### Test tất cả AI-generated tests

```bash
npm test tests/ai-generated/
```

### Test tất cả (manual + AI)

```bash
npm test
```

---

## 📊 Ví Dụ Output

### Console Output

```
╔════════════════════════════════════════════╗
║   🤖 AI-Powered Test Generator            ║
║   Powered by Google Gemini                ║
╚════════════════════════════════════════════╝

🔍 Analyzing controller: controllers/userController.js
📋 Found 2 functions: loginUser, registerUser
🤖 Generating tests for userController...
✅ Test saved to: d:\...\tests\ai-generated\userController.ai.test.js

✨ Test generation completed!
📁 File: d:\...\tests\ai-generated\userController.ai.test.js
📊 Functions covered: 2

💡 Next steps:
   1. Review the generated test file
   2. Run: npm test tests/ai-generated\userController.ai.test.js
   3. Adjust tests as needed
```

### Generated Test Example

```javascript
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import userModel from "../../../models/userModel.js";

describe("User Controller API Tests", () => {
  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  describe("POST /api/user/register", () => {
    it("should register new user successfully", async () => {
      const res = await request(app)
        .post("/api/user/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123"
        });
      
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it("should reject duplicate email", async () => {
      // ... more tests
    });
  });
});
```

---

## 🎯 Best Practices

### 1. Review Generated Tests

AI-generated tests nên được **review** trước khi sử dụng:
- ✅ Kiểm tra logic có đúng không
- ✅ Thêm edge cases nếu cần
- ✅ Adjust assertions cho phù hợp

### 2. Combine với Manual Tests

- Dùng AI để tạo test skeleton nhanh
- Manual tests cho business logic phức tạp
- AI tests cho CRUD operations đơn giản

### 3. Iterate và Improve

Nếu generated test không tốt:
```bash
# Generate lại với preview
npm run ai:generate -- --controller foodController --preview

# Xem output, nếu OK thì save
npm run ai:generate -- --controller foodController
```

---

## 🔧 Troubleshooting

### Lỗi: "GEMINI_API_KEY not found"

**Giải pháp:**
```bash
# Kiểm tra .env file
cat backend/.env

# Phải có dòng:
GEMINI_API_KEY=AIzaSy...
```

### Lỗi: "Failed to analyze controller"

**Nguyên nhân:** Controller file không tồn tại

**Giải pháp:**
```bash
# Kiểm tra tên controller
ls backend/controllers/

# Đảm bảo tên đúng format: *Controller.js
npm run ai:generate -- --controller userController  # ✅ Đúng
npm run ai:generate -- --controller user            # ❌ Sai
```

### Generated test bị lỗi syntax

**Giải pháp:**
- AI đôi khi wrap code trong markdown ```
- Generator đã tự động extract code
- Nếu vẫn lỗi, check file manually và fix

### API Rate Limit

**Google Gemini Free Tier:**
- 1,500 requests/day
- Nếu vượt quá, đợi 24h hoặc upgrade plan

---

## 📈 Metrics & Quality

### Coverage Expected

AI-generated tests thường cover:
- ✅ 80-90% success cases
- ✅ 70-80% error cases  
- ✅ 50-60% edge cases

### Quality Indicators

**Good generated test:**
- Có `beforeEach` cleanup
- Test cả success và error paths
- Assertions rõ ràng
- Descriptive test names

**Needs improvement:**
- Thiếu edge cases
- Assertions quá generic
- Không test validation

---

## 🎓 Cho Báo Cáo Môn Học

### Demo AI Test Generation

**Bước 1:** Generate test
```bash
npm run ai:generate -- --controller categoryController
```

**Bước 2:** Chạy test
```bash
npm test tests/ai-generated/categoryController.ai.test.js
```

**Bước 3:** Screenshot
- CLI output với colors
- Generated test file
- Test results (PASS/FAIL)

### So sánh Manual vs AI

| Aspect | Manual Tests | AI-Generated Tests |
|--------|-------------|-------------------|
| Thời gian | 30-60 phút/controller | 30 giây/controller |
| Coverage | 90-100% | 70-90% |
| Edge cases | Tốt hơn | Cần review |
| Maintenance | Dễ | Cần adjust |

---

## 🔗 Resources

- **Google Gemini API**: https://ai.google.dev
- **Vitest Docs**: https://vitest.dev
- **Supertest**: https://github.com/ladjs/supertest

---

## 💡 Tips

1. **Start small**: Generate cho 1 controller đơn giản trước (categoryController)
2. **Use preview**: Luôn preview trước khi save
3. **Iterate**: Nếu không hài lòng, generate lại
4. **Combine**: Mix AI tests với manual tests
5. **Review always**: AI không hoàn hảo, cần human review

---

**Tạo bởi:** AI-Powered Test Generator  
**Framework:** Google Gemini + Vitest + Supertest  
**Status:** Production Ready ✅
