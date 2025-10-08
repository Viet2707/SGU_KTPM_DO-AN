SGU_KTPM_DO-AN
Hệ thống web đặt món ăn (monorepo):

backend: Node.js + Express + MongoDB (Mongoose)
frontend: React + Vite (người dùng)
admin: React + Vite (quản trị)
CI/CD: GitHub Actions (test theo giai đoạn, build-check, build & push Docker images)
Badges

Backend Tests
Frontends Build
Docker Build (GHCR)
Tính năng chính
User: đăng ký/đăng nhập, xem món, giỏ hàng, đặt món, theo dõi đơn
Product (Food): CRUD món ăn, danh mục
Cart: quản lý giỏ hàng
Inventory (Stock): quản lý kho
Admin: quản trị món, đơn, user, kho, danh mục
Upload ảnh (serve qua /images)
Kiến trúc thư mục
text

SGU_KTPM_DO-AN/
│
├── admin/                 # React + Vite (giao diện quản trị)
│   ├── src/
│   │   ├── assets/
│   │   ├── components/ (Navbar, Sidebar, AdminHeader, AdminProtected, EditFood, ...)
│   │   ├── pages/ (Add, List, Orders, Users, Stock, Update, ...)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── vite.config.js
│   └── package.json
│
├── frontend/              # React + Vite (giao diện khách)
│   ├── public/assets/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/ (Navbar, Header, FoodItem, FoodDisplay, ExploreMenu, Cart, ...)
│   │   ├── Context/StoreContext.jsx
│   │   ├── pages/ (Home, ProductDetail, Cart, PlaceOrder, MyOrders, OrderDetail, Verify)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
│
├── backend/               # Node.js + Express + MongoDB
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── userController.js
│   │   ├── foodController.js
│   │   ├── orderController.js
│   │   ├── stockController.js
│   │   ├── cartController.js
│   │   └── categoryController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── adminAuth.js
│   │   ├── requireAdmin.js
│   │   └── upload.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── adminModel.js
│   │   ├── foodModel.js
│   │   ├── orderModel.js
│   │   ├── stockModel.js
│   │   └── categoryModel.js
│   ├── routes/
│   │   ├── adminRoute.js
│   │   ├── adminUserRoute.js
│   │   ├── userRoute.js
│   │   ├── foodRoute.js
│   │   ├── cartRoute.js
│   │   ├── orderRoute.js
│   │   ├── stockRoutes.js          # (đặt tên trùng với import trong app.js)
│   │   └── categoryRoute.js
│   ├── uploads/                    # lưu ảnh upload
│   ├── app.js                      # khai báo app, middleware, routes
│   ├── server.js                   # connect DB + app.listen
│   ├── genAdminHash.js
│   ├── package.json
│   └── (tùy chọn) .env, jest/vitest config & tests/
│
├── .github/workflows/
│   ├── staged-tests.yml            # CI: test backend theo 4 giai đoạn
│   ├── web-build.yml               # CI: build-check frontend & admin
│   └── docker-build.yml            # CI: build & push Docker images lên GHCR
│
├── docker-compose.yml              # Compose build từ source (dev/local)
├── docker-compose.ghcr.yml         # Compose dùng images GHCR (tải về chạy ngay)
├── README.md
└── LICENSE (nếu có)
API endpoints (prefix thực tế trong app.js)
GET / → “API Working 🌱”
/api/user, /api/food, /api/cart, /api/order, /api/stocks, /api/category
/api/admin, /api/admin/users
Ảnh tĩnh: /images → backend/uploads
Chạy nhanh nhất (không cần build) – dùng images trên GHCR
Dành cho giảng viên/anh em “clone về chạy một lệnh”:

Cài Docker Desktop
Clone repo:
git clone https://github.com/Viet2707/SGU_KTPM_DO-AN.git
cd SGU_KTPM_DO-AN
Kéo image và chạy:
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d
Truy cập:
API: http://localhost:5000
Frontend: http://localhost:8080
Admin: http://localhost:8081
Dừng:
docker compose -f docker-compose.ghcr.yml down
Reset DB (xóa volume Mongo):
docker compose -f docker-compose.ghcr.yml down -v
Images GHCR (public)

ghcr.io/viet2707/sgu_ktpm_do-an:api-latest
ghcr.io/viet2707/sgu_ktpm_do-an:web-latest
ghcr.io/viet2707/sgu_ktpm_do-an:admin-latest
Lưu ý:

Nếu “pull access denied”, vào GitHub → Packages → đặt các package Public.
Nếu cổng bận: đổi cổng bên trái trong compose (“5001:5000”, “8082:80”, …).
Chạy dev/local (build từ source)
Yêu cầu: Docker Desktop

docker compose up -d --build
API: http://localhost:5000
Frontend: http://localhost:8080
Admin: http://localhost:8081
Dừng: docker compose down
Reset DB: docker compose down -v
Uploads

Ảnh được bind mount: ./backend/uploads ↔ /app/uploads (giữ dữ liệu ngoài container)
Dùng MongoDB Atlas (tuỳ chọn)

Sửa service api trong docker-compose.yml: MONGODB_URI=chuỗi Atlas
Có thể bỏ service mongo trong compose
Cấu hình môi trường
Không commit file .env thật. Hãy thêm .env.example để tham khảo.

Backend (backend/.env)

Dùng khi chạy server thật. Test sẽ ưu tiên MONGODB_URI_TEST (DB test riêng).
text

PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/food_delivery_db?retryWrites=true&w=majority
MONGODB_URI_TEST=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/food_delivery_test?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
Frontend/Admin (Vite)

file .env.local trong từng app:
text

VITE_API_URL=http://localhost:5000
Trong code: dùng import.meta.env.VITE_API_URL
Test backend (staged)
Công nghệ: Vitest + Supertest. Test theo 4 giai đoạn:

1: user chạy được
2: user + product (food)
3: + cart
4: + inventory (stock)
Chạy local

text

cd backend
npm run test:1
npm run test:2
npm run test:3
npm run test:4
CI/CD (GitHub Actions)
Workflows

.github/workflows/staged-tests.yml
Spin-up Mongo container và chạy test 4 giai đoạn
.github/workflows/web-build.yml
Build-check 2 frontend (Vite)
.github/workflows/docker-build.yml
Build 3 Docker images (api/web/admin) và push lên GHCR
Tag: {name}-latest và {name}-${GITHUB_SHA}
Gợi ý bảo vệ nhánh

Settings → Branches → main → Require status checks to pass
Tick các job từ 3 workflow trên để đảm bảo chất lượng trước khi merge
Cập nhật image GHCR

Push vào main → workflow docker-build.yml tự build & push
Người dùng chỉ cần: docker compose -f docker-compose.ghcr.yml pull && up -d
Phát triển không Docker (tuỳ chọn)
Backend

text

cd backend
npm ci
npm run server     # nodemon server.js (PORT=5000)
Frontend

text

cd frontend
npm ci
npm run dev        # http://localhost:5173
Admin

text

cd admin
npm ci
npm run dev        # ví dụ --port 5174
Troubleshooting
Port đang bận (5000/8080/8081)
Đổi cổng bên trái trong compose (“5001:5000”, …)
Windows: netstat -aon | findstr :5000 → taskkill /PID <pid> /F
FE/Admin không gọi được API
Images FE/Admin build với VITE_API_URL=http://localhost:5000 (xem docker-build.yml)
Nếu đổi port API, sửa build_args trong workflow, rồi chạy lại CI
Pull GHCR denied
Đặt package Public
“repository name must be lowercase”
Đường dẫn image phải chữ thường: ghcr.io/viet2707/sgu_ktpm_do-an:api-latest
Kết nối Mongo lỗi
Với compose local: API dùng mongodb://mongo:27017/food_delivery_db
Với Atlas: mở IP Access List (tạm 0.0.0.0/0 khi dev), encode mật khẩu nếu có ký tự đặc biệt
Góp ý
PR/Issue welcome
Không commit secrets (.env). Dùng .env.example.
License
MIT (tuỳ chọn – thêm file LICENSE)
Phụ lục: Lệnh nhanh

Chạy bằng image GHCR:
docker compose -f docker-compose.ghcr.yml pull && docker compose -f docker-compose.ghcr.yml up -d
Chạy dev từ source:
docker compose up -d --build
Dừng:
docker compose down
Dừng + xoá dữ liệu Mongo:
docker compose down -v
Log:
docker compose logs -f api
docker compose logs -f mongo
