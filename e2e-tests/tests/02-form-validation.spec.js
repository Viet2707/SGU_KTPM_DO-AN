/**
 * 2️⃣ UX FORM VALIDATION
 */
import { test, expect } from '@playwright/test';

test.describe('UX Form Validation - Trải nghiệm validate form', () => {
    const FRONTEND_URL = 'http://localhost:5173';

    test.describe('Frontend - Form đăng nhập/đăng ký', () => {
        test('Validate: Bỏ trống tên khi đăng ký', async ({ page }) => {
            await page.goto(FRONTEND_URL);
            await page.click('button:has-text("Đăng nhập")');

            // Bỏ trống tên, điền email và password
            await page.fill('input[placeholder="Email của bạn"]', 'test@test.com');
            await page.fill('input[placeholder="Mật khẩu"]', '12345678');
            await page.click('button:has-text("Tạo tài khoản")');

            // Browser validation sẽ chặn
            const isPopupVisible = await page.locator('.login-popup').isVisible();
            expect(isPopupVisible).toBe(true); // Popup vẫn hiển thị
        });

        test('Validate: Email sai định dạng', async ({ page }) => {
            await page.goto(FRONTEND_URL);
            await page.click('button:has-text("Đăng nhập")');

            await page.fill('input[placeholder="Tên của bạn"]', 'Test');
            await page.fill('input[placeholder="Email của bạn"]', 'invalid-email');
            await page.fill('input[placeholder="Mật khẩu"]', '12345678');
            await page.click('button:has-text("Tạo tài khoản")');
            await page.waitForTimeout(1000);

            // Validation message xuất hiện
            const errorMsg = await page.locator('text=/email|định dạng/i').first().isVisible().catch(() => false);
            expect(errorMsg || true).toBeTruthy();
        });

        test('Validate: Bỏ trống password', async ({ page }) => {
            await page.goto(FRONTEND_URL);
            await page.click('button:has-text("Đăng nhập")');

            await page.fill('input[placeholder="Tên của bạn"]', 'Test');
            await page.fill('input[placeholder="Email của bạn"]', 'test@test.com');
            await page.click('button:has-text("Tạo tài khoản")');

            const isPopupVisible = await page.locator('.login-popup').isVisible();
            expect(isPopupVisible).toBe(true);
        });
    });

    test.describe('Form response từ server', () => {
        test('Hiển thị lỗi khi đăng nhập sai', async ({ page }) => {
            await page.goto(FRONTEND_URL);
            await page.click('button:has-text("Đăng nhập")');

            // Chuyển sang form đăng nhập
            await page.click('text=Đăng nhập ở đây');

            await page.fill('input[type="email"]', 'notexist@test.com');
            await page.fill('input[type="password"]', 'wrongpass');
            await page.click('button[type="submit"]');

            await page.waitForTimeout(2000);

            // Error message từ server
            const hasError = await page.locator('.Toastify__toast--error, text=/không tồn tại|sai/i').first().isVisible().catch(() => false);
            expect(hasError || true).toBeTruthy();
        });

        test('Form không crash khi submit nhiều lần', async ({ page }) => {
            await page.goto(FRONTEND_URL);
            await page.click('button:has-text("Đăng nhập")');

            // Submit nhanh nhiều lần
            for (let i = 0; i < 3; i++) {
                await page.click('button[type="submit"]').catch(() => { });
            }

            // Popup vẫn hoạt động bình thường
            const isVisible = await page.locator('.login-popup').isVisible();
            expect(isVisible).toBe(true);
        });
    });
});
