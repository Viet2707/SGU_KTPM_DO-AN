/**
 * =========================================================
 * E2E USER JOURNEY – FULL ORDER FLOW
 * Login → Browse → View Detail → Add to Cart → Checkout → Success
 *
 * Đây là E2E chuẩn:
 * - Test 1 luồng nghiệp vụ hoàn chỉnh
 * - Không test từng nút rời rạc
 * - Không mock business logic
 * =========================================================
 */

import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:5173';
const TEST_USER = {
    email: 'haikhongngu@gmail.com',
    password: '12345678',
};

test.describe('E2E User Journey - Full Order Flow', () => {

    test('Complete Order Flow: Login → Browse → Add to Cart → Checkout → Success', async ({ page }) => {
        test.setTimeout(60000); // Tăng thời gian timeout lên 60s cho flow dài

        /* =====================================================
           STEP 1 – USER TRUY CẬP HỆ THỐNG
        ===================================================== */
        await test.step('1. User truy cập website', async () => {
            await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
            await expect(page.locator('.navbar')).toBeVisible();
        });

        /* =====================================================
           STEP 2 – ĐĂNG NHẬP
        ===================================================== */
        await test.step('2. User đăng nhập', async () => {
            // Mở popup login
            await page.click('button:has-text("Đăng nhập")');
            await expect(page.locator('.login-popup')).toBeVisible();

            // Nếu đang ở form đăng ký → chuyển sang login
            const switchToLogin = page.locator('text=Đăng nhập ở đây');
            if (await switchToLogin.isVisible()) {
                await switchToLogin.click();
            }

            // Nhập thông tin
            await page.fill('input[type="email"]', TEST_USER.email);
            await page.fill('input[type="password"]', TEST_USER.password);

            // Submit
            await page.click('button[type="submit"]');

            // Đăng nhập thành công = profile icon xuất hiện
            await expect(page.locator('.navbar-profile')).toBeVisible({ timeout: 10000 });

            // Login popup phải biến mất
            await expect(page.locator('.login-popup')).toBeHidden({ timeout: 5000 });
        });

        /* =====================================================
           STEP 3 – LOAD DANH SÁCH SẢN PHẨM
        ===================================================== */
        await test.step('3. Hiển thị danh sách sản phẩm', async () => {
            const foodItems = page.locator('.food-item');

            await expect(foodItems.first()).toBeVisible({ timeout: 10000 });

            const count = await foodItems.count();
            if (count === 0) {
                throw new Error('Không có sản phẩm nào hiển thị trên trang chủ');
            }
        });

        /* =====================================================
           STEP 4 – XEM CHI TIẾT SẢN PHẨM
        ===================================================== */
        await test.step('4. Xem chi tiết sản phẩm', async () => {
            const firstFood = page.locator('.food-item').first();

            await expect(firstFood).toBeVisible();
            await firstFood.click();

            await expect(page).toHaveURL(/\/product\//);
            await page.waitForLoadState('networkidle');
        });

        /* =====================================================
           STEP 5 – ADD TO CART
        ===================================================== */
        await test.step('5. Thêm sản phẩm vào giỏ hàng', async () => {
            const addToCartBtn = page.locator('button:has-text("ADD TO CART"), button:has-text("Thêm vào giỏ"), .add-to-cart-btn').first();

            await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
            await expect(addToCartBtn).toBeEnabled();

            await addToCartBtn.click();

            // Giỏ hàng có dot báo hiệu
            await expect(page.locator('.navbar-search-icon .dot'))
                .toBeVisible({ timeout: 5000 });
        });

        /* =====================================================
           STEP 6 – XEM GIỎ HÀNG
        ===================================================== */
        await test.step('6. Xem giỏ hàng', async () => {
            await page.locator('.navbar-search-icon').click();

            await expect(page).toHaveURL(/\/cart/);
            await expect(page.locator('.cart-items-item')).toBeVisible();

            await page.click('button:has-text("TIẾN HÀNH THANH TOÁN")');
        });

        /* =====================================================
           STEP 7 – CHECKOUT
        ===================================================== */
        await test.step('7. Nhập thông tin giao hàng', async () => {
            await expect(page).toHaveURL(/\/order/);

            await page.fill('input[name="firstName"]', 'Nguyen');
            await page.fill('input[name="lastName"]', 'Van A');
            await page.fill('input[name="email"]', TEST_USER.email);
            await page.fill('input[name="street"]', '123 Duong ABC');
            await page.fill('input[name="city"]', 'TP HCM');
            await page.fill('input[name="state"]', 'Quan 1');
            await page.fill('input[name="country"]', 'Vietnam');
            await page.fill('input[name="phone"]', '0909123456');
        });

        /* =====================================================
           STEP 8 – ĐẶT HÀNG
        ===================================================== */
        await test.step('8. Thực hiện đặt hàng', async () => {
            await page.click('button[type="submit"]');
        });

        /* =====================================================
           STEP 9 – VERIFY KẾT QUẢ
        ===================================================== */
        await test.step('9. Xác nhận đặt hàng thành công', async () => {
            await expect(page).toHaveURL(/\/myorders/, { timeout: 15000 });

            const latestOrder = page.locator('.my-orders-order').first();
            await expect(latestOrder).toBeVisible();
            await expect(latestOrder).toContainText('Food Processing');
        });
    });

});
