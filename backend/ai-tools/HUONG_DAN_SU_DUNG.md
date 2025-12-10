# 🤖 Hướng dẫn sử dụng AI-Powered Test Generator

## 🌟 Giới thiệu
Đây là công cụ tự động tạo **Integration Tests** cho các Controller trong dự án Backend, sử dụng sức mạnh của **Google Gemini AI**.
Công cụ giúp tiết kiệm 90% thời gian viết test thủ công bằng cách tự động phân tích code và sinh ra các kịch bản kiểm thử (Test Cases) chuẩn xác.

## 🚀 Tính năng nổi bật
*   **Tự động phân tích**: Đọc hiểu code Controller để xác định các hàm cần test.
*   **Kịch bản đa dạng**: Tự động sinh test case cho các trường hợp:
    *   ✅ Thành công (Happy Path).
    *   ❌ Lỗi Validation (thiếu field, sai định dạng).
    *   🔍 Không tìm thấy (404 Not Found).
    *   💥 Lỗi Server (500 Internal Server Error).
*   **Xử lý thông minh**: Tự động thử lại (Retry) khi API Google bị quá tải hoặc lỗi mạng.
*   **Chuẩn Vitest**: Code sinh ra chạy ngay được với framework Vitest & Supertest.
*   **Chế độ Scenarios**: Hỗ trợ sinh danh sách kịch bản test (file .md) để review trước khi sinh code test thật.

## 🛠️ Cài đặt & Cấu hình

1.  **Lấy API Key**:
    *   Truy cập [Google AI Studio](https://aistudio.google.com/apikey) để lấy API Key miễn phí.

2.  **Cấu hình biến môi trường**:
    *   Mở file `backend/.env`.
    *   Thêm dòng sau vào cuối file:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

## 📖 Cách sử dụng

Công cụ được tích hợp sẵn qua CLI (Command Line Interface).

### 1. Tạo test cho một Controller cụ thể
Dùng khi bạn vừa code xong một feature và muốn test ngay.

```bash
# Ví dụ: Tạo test cho categoryController
npm run ai:generate -- --controller categoryController
```
*Lưu ý: Tên controller không phân biệt hoa thường, có thể gõ `category` hoặc `categoryController`.*

### 2. Xem trước (Preview) mà không lưu file
Dùng để kiểm tra xem AI sẽ viết gì mà không ghi đè file hiện tại.

```bash
c --preview
```

### 3. Tạo test cho TẤT CẢ Controllers
Dùng để generate test hàng loạt cho toàn bộ dự án.

```bash
npm run ai:generate -- --all
```

### 4. Chỉ tạo danh sách Kịch bản Test (Scenarios)
Dùng khi bạn chỉ muốn AI liệt kê danh sách các trường hợp cần test (để review lên kế hoạch) chứ chưa cần sinh code. Kết quả sẽ được **nối tiếp (append)** vào file nhật ký chung.

```bash
# Cho 1 controller
npm run ai:generate -- --controller orderController --scenarios

# Cho toàn bộ dự án
npm run ai:generate -- --all --scenarios
```

## 📂 Kết quả đầu ra
*   File test sẽ được lưu tự động tại: `backend/tests/ai-generated/`
*   Định dạng tên file code: `[controllerName].ai.test.js`
*   **File nhật ký scenarios**: Các kịch bản test (cả khi sinh code và khi chạy mode `--scenarios`) sẽ được lưu vào file:
    `backend/tests/ai-generated/generated_test_scenarios.md`
*   Sau khi tạo xong, bạn chạy test bằng lệnh:
    ```bash
    # Chạy một file cụ thể
    npx vitest run tests/ai-generated/categoryController.ai.test.js

    # Hoặc chạy toàn bộ test
    npm test
    ```

## ❓ Câu hỏi thường gặp (FAQ)

**Q: Tool báo lỗi "429 Too Many Requests"?**
A: Đây là giới hạn của gói miễn phí Google Gemini. Tool đã có cơ chế tự động chờ và thử lại, bạn cứ treo máy khoảng 1-2 phút nó sẽ tự chạy tiếp.

**Q: Test chạy bị báo lỗi 404 (Not Found)?**
A: Kiểm tra lại đường dẫn API (Route) trong file test. AI đôi khi đoán sai số ít/số nhiều (ví dụ: `/api/categories` thay vì `/api/category`).
*   **Giải pháp**: Mở file test ra và sửa lại đường dẫn cho khớp với `app.js`.

**Q: Tôi muốn đổi model AI khác (mạnh hơn hoặc nhanh hơn)?**
A: Mở file `backend/ai-tools/ai-test-generator.js`, tìm mảng `MODELS_TO_TRY` và đổi thứ tự priority.

---
*Tài liệu nội bộ dự án SGU_KTPM_DO-AN*
