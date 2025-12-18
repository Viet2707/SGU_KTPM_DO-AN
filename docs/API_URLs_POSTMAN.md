# 📋 DANH SÁCH TẤT CẢ API URLs - COPY & PASTE VÀO POSTMAN

**Base URL:** `http://localhost:5000`

---

## 🔐 1. USER APIs (Xác thực người dùng)

### 1.1 Đăng ký tài khoản
```
POST    http://localhost:5000/api/user/register
```
**Body (raw - JSON):**
```json
{
  "name": "Nguyen Van A",
  "email": "nguyenvana@gmail.com",
  "password": "12345678"
}
```

---

### 1.2 Đăng nhập
```
POST    http://localhost:5000/api/user/login
```
**Body (raw - JSON):**
```json
{
  "email": "nguyenvana@gmail.com",
  "password": "12345678"
}
```

---

### 1.3 Kiểm tra trạng thái user (Cần Token)
```
GET     http://localhost:5000/api/user/status
```
**Headers:**
```
Authorization: Bearer <your_token>
```

---

## 🍔 2. FOOD APIs (Quản lý món ăn)

### 2.1 Lấy danh sách món ăn
```
GET     http://localhost:5000/api/food/list
```
*Không cần body hay headers*

---

### 2.2 Thêm món ăn mới
```
POST    http://localhost:5000/api/food/add
```
**Body (form-data):**
| Key         | Value                    | Type |
|-------------|--------------------------|------|
| name        | Phở Bò Đặc Biệt          | Text |
| description | Phở truyền thống Hà Nội  | Text |
| price       | 45000                    | Text |
| category    | Noodles                  | Text |
| image       | (chọn file ảnh)          | File |

---

### 2.3 Xóa món ăn
```
POST    http://localhost:5000/api/food/remove
```
**Body (raw - JSON):**
```json
{
  "id": "67630e5e12345678abcdef"
}
```

---

### 2.4 Cập nhật món ăn
```
PUT     http://localhost:5000/api/food/{id}
```
**Ví dụ:** `http://localhost:5000/api/food/67630e5e12345678abcdef`

**Body (form-data):**
| Key   | Value              | Type |
|-------|--------------------|------|
| name  | Tên mới            | Text |
| price | 50000              | Text |
| image | (file mới nếu có)  | File |

---

## 🛒 3. CART APIs (Giỏ hàng) - TẤT CẢ CẦN TOKEN

### 3.1 Thêm món vào giỏ hàng
```
POST    http://localhost:5000/api/cart/add
```
**Headers:**
```
Authorization: Bearer <your_token>
```
**Body (raw - JSON):**
```json
{
  "itemId": "67630e5e12345678abcdef"
}
```

---

### 3.2 Lấy giỏ hàng
```
POST    http://localhost:5000/api/cart/get
```
**Headers:**
```
Authorization: Bearer <your_token>
```
**Body:** `{}`

---

### 3.3 Xóa 1 món khỏi giỏ hàng
```
POST    http://localhost:5000/api/cart/remove
```
**Headers:**
```
Authorization: Bearer <your_token>
```
**Body (raw - JSON):**
```json
{
  "itemId": "67630e5e12345678abcdef"
}
```

---

### 3.4 Xóa tất cả món trong giỏ
```
POST    http://localhost:5000/api/cart/remove-all
```
**Headers:**
```
Authorization: Bearer <your_token>
```
**Body:** `{}`

---

## 📦 4. ORDER APIs (Đơn hàng)

### 4.1 Đặt hàng COD (Cần Token)
```
POST    http://localhost:5000/api/order/placecod
```
**Headers:**
```
Authorization: Bearer <your_token>
```
**Body (raw - JSON):**
```json
{
  "items": [
    {
      "_id": "67630e5e12345678abcdef",
      "name": "Cơm Gà Xối Mỡ",
      "price": 35000,
      "quantity": 2
    }
  ],
  "amount": 70000,
  "address": {
    "firstName": "Nguyen",
    "lastName": "Van A",
    "email": "nguyenvana@gmail.com",
    "street": "123 Duong ABC",
    "city": "TP.HCM",
    "state": "Quan 1",
    "zipcode": "700000",
    "country": "Viet Nam",
    "phone": "0912345678"
  }
}
```

---

### 4.2 Đặt hàng Online (Cần Token)
```
POST    http://localhost:5000/api/order/place
```
**Headers:**
```
Authorization: Bearer <your_token>
```
**Body:** Giống như placecod

---

### 4.3 Lấy lịch sử đơn hàng của user (Cần Token)
```
POST    http://localhost:5000/api/order/userorders
```
**Headers:**
```
Authorization: Bearer <your_token>
```
**Body:** `{}`

---

### 4.4 Lấy chi tiết đơn hàng theo ID
```
GET     http://localhost:5000/api/order/{orderId}
```
**Ví dụ:** `http://localhost:5000/api/order/67631abc12345678`

---

### 4.5 Lấy danh sách tất cả đơn hàng (Admin)
```
GET     http://localhost:5000/api/order/list
```

---

### 4.6 Cập nhật trạng thái đơn hàng (Admin)
```
POST    http://localhost:5000/api/order/status
```
**Body (raw - JSON):**
```json
{
  "orderId": "67631abc12345678",
  "status": "Out for delivery"
}
```
**Trạng thái:** `Food Processing` | `Out for delivery` | `Delivered`

---

## 📂 5. CATEGORY APIs (Danh mục)

### 5.1 Lấy danh sách danh mục
```
GET     http://localhost:5000/api/category/list
```
hoặc
```
GET     http://localhost:5000/api/category
```

---

### 5.2 Tạo danh mục mới
```
POST    http://localhost:5000/api/category
```
**Body (raw - JSON):**
```json
{
  "name": "Drinks",
  "description": "Đồ uống các loại"
}
```

---

### 5.3 Cập nhật danh mục
```
PUT     http://localhost:5000/api/category/{id}
```
**Ví dụ:** `http://localhost:5000/api/category/67630abc123`

**Body (raw - JSON):**
```json
{
  "name": "Beverages",
  "description": "Đồ uống giải khát"
}
```

---

### 5.4 Xóa danh mục
```
DELETE  http://localhost:5000/api/category/{id}
```
**Ví dụ:** `http://localhost:5000/api/category/67630abc123`

---

## 📦 6. STOCK APIs (Quản lý kho)

### 6.1 Lấy tất cả stocks
```
GET     http://localhost:5000/api/stock
```

---

### 6.2 Tạo Food + Stock mới
```
POST    http://localhost:5000/api/stock
```
**Body (form-data):**
| Key         | Value              | Type |
|-------------|-------------------|------|
| name        | Tên món           | Text |
| description | Mô tả             | Text |
| price       | 50000             | Text |
| category    | Rice              | Text |
| quantity    | 100               | Text |
| image       | (chọn file ảnh)   | File |

---

### 6.3 Cập nhật Stock
```
PUT     http://localhost:5000/api/stock/{foodId}
```
**Ví dụ:** `http://localhost:5000/api/stock/67630e5e123`

**Body (form-data):** Tương tự như POST

---

### 6.4 Xóa Stock
```
DELETE  http://localhost:5000/api/stock/{stockId}
```
**Ví dụ:** `http://localhost:5000/api/stock/67630abc123`

---

### 6.5 Thay đổi số lượng Stock
```
POST    http://localhost:5000/api/stock/change
```
**Body (raw - JSON):**
```json
{
  "stockId": "67630abc123",
  "delta": 10
}
```
*`delta` dương = tăng, âm = giảm*

---

## 👨‍💼 7. ADMIN APIs

### 7.1 Đăng nhập Admin
```
POST    http://localhost:5000/api/admin/login
```
**Body (raw - JSON):**
```json
{
  "email": "admin@foodfast.com",
  "password": "admin123"
}
```

---

### 7.2 Lấy danh sách users (Cần Admin Auth)
```
GET     http://localhost:5000/api/admin/users
```
**Headers:**
```
Authorization: Bearer <admin_token>
```

---

### 7.3 Cập nhật trạng thái user (Cần Admin Auth)
```
PATCH   http://localhost:5000/api/admin/users/{userId}/status
```
**Ví dụ:** `http://localhost:5000/api/admin/users/67630e5e123/status`

**Headers:**
```
Authorization: Bearer <admin_token>
```
**Body (raw - JSON):**
```json
{
  "status": "lock"
}
```
*Trạng thái: `active` | `lock`*

---

## 📝 TỔNG HỢP NHANH (COPY & PASTE)

```
# USER
POST    http://localhost:5000/api/user/register
POST    http://localhost:5000/api/user/login
GET     http://localhost:5000/api/user/status

# FOOD
GET     http://localhost:5000/api/food/list
POST    http://localhost:5000/api/food/add
POST    http://localhost:5000/api/food/remove
PUT     http://localhost:5000/api/food/{id}

# CART (cần token)
POST    http://localhost:5000/api/cart/add
POST    http://localhost:5000/api/cart/get
POST    http://localhost:5000/api/cart/remove
POST    http://localhost:5000/api/cart/remove-all

# ORDER
POST    http://localhost:5000/api/order/place
POST    http://localhost:5000/api/order/placecod
POST    http://localhost:5000/api/order/userorders
POST    http://localhost:5000/api/order/status
GET     http://localhost:5000/api/order/list
GET     http://localhost:5000/api/order/{id}

# CATEGORY
GET     http://localhost:5000/api/category/list
GET     http://localhost:5000/api/category
POST    http://localhost:5000/api/category
PUT     http://localhost:5000/api/category/{id}
DELETE  http://localhost:5000/api/category/{id}

# STOCK
GET     http://localhost:5000/api/stock
POST    http://localhost:5000/api/stock
PUT     http://localhost:5000/api/stock/{foodId}
DELETE  http://localhost:5000/api/stock/{stockId}
POST    http://localhost:5000/api/stock/change

# ADMIN
POST    http://localhost:5000/api/admin/login
GET     http://localhost:5000/api/admin/users
PATCH   http://localhost:5000/api/admin/users/{id}/status
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Password:** Phải có ít nhất **8 ký tự**
2. **Token:** Lấy từ response của `/login` hoặc `/register`
3. **Headers cho Auth:** `Authorization: Bearer eyJhbGci...`
4. **Body type:**
   - Hầu hết: `raw` → `JSON`
   - Upload ảnh: `form-data`
5. **{id}:** Thay bằng ID thực tế từ database (24 ký tự hex)

---

**Chúc bạn test thành công! 🚀**
